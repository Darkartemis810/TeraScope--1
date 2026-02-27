import os
import math
import time
import logging
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen

from flask import Flask, jsonify, request, g
from flask_cors import CORS
from PIL import Image
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE_DIR / "final_model" / "terrascope_best.pt"))
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("terascope-ai-api")

app = Flask(__name__)
CORS(app)

CLASS_SEVERITY: dict[str, float] = {
    "no_damage": 0.05,
    "minor_damage": 0.35,
    "major_damage": 0.75,
    "destroyed": 1.00,
}


def _load_model() -> YOLO:
    logger.info("Loading model from %s", MODEL_PATH)
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")
    loaded_model = YOLO(str(MODEL_PATH))
    logger.info("Model loaded successfully")
    return loaded_model


model = _load_model()


def _to_python(value: Any) -> Any:
    if hasattr(value, "item"):
        return value.item()
    return value


def _severity_from_label(label: str) -> float:
    text = label.lower()
    if text in CLASS_SEVERITY:
        return CLASS_SEVERITY[text]
    if "destroy" in text:
        return 1.0
    if "major" in text:
        return 0.75
    if "minor" in text:
        return 0.35
    if "no_damage" in text or "intact" in text:
        return 0.05
    return 0.5


def _score_to_category(score: float) -> dict[str, Any]:
    if score >= 80:
        return {"category": 1, "risk_level": "highest"}
    if score >= 60:
        return {"category": 2, "risk_level": "high"}
    if score >= 40:
        return {"category": 3, "risk_level": "moderate"}
    if score >= 20:
        return {"category": 4, "risk_level": "low"}
    return {"category": 5, "risk_level": "lowest"}


def _build_assessment(detections: list[dict[str, Any]], classification: dict[str, Any] | None) -> dict[str, Any]:
    weighted_area_impact = 0.0
    affected_area_ratio = 0.0
    confidence_sum = 0.0
    severity_numerator = 0.0
    max_severity = 0.0

    for det in detections:
        conf = float(det.get("confidence") or 0.0)
        area_ratio = float(det.get("bbox_area_ratio") or 0.0)
        severity = _severity_from_label(str(det.get("class_name") or ""))
        weighted_area_impact += conf * area_ratio * severity
        affected_area_ratio += area_ratio
        confidence_sum += conf
        severity_numerator += severity * conf
        max_severity = max(max_severity, severity)

    affected_area_ratio = max(0.0, min(1.0, affected_area_ratio))
    avg_conf = (confidence_sum / len(detections)) if detections else 0.0
    avg_severity = (severity_numerator / confidence_sum) if confidence_sum > 0 else 0.0

    detection_score = min(
        100.0,
        weighted_area_impact * 180.0
        + avg_severity * 30.0
        + max_severity * 20.0
        + min(10.0, len(detections) * 1.5),
    )

    classification_score = 0.0
    if classification is not None:
        cls_conf = float(classification.get("top1_confidence") or 0.0)
        cls_severity = _severity_from_label(str(classification.get("top1_class_name") or ""))
        classification_score = cls_conf * cls_severity * 100.0

    if detections:
        damage_score = min(100.0, detection_score + 0.15 * classification_score)
    elif classification is not None:
        damage_score = min(100.0, max(3.0, classification_score))
    else:
        damage_score = 5.0

    category_info = _score_to_category(damage_score)

    estimated_loss_inr = int((weighted_area_impact * 1_200_000_000) + (damage_score / 100.0) * 80_000_000)
    estimated_loss_inr = max(500_000, estimated_loss_inr)

    ndrf_teams_required = max(1, min(20, math.ceil((damage_score / 22.0) + (weighted_area_impact * 18.0))))
    assessment_confidence = min(1.0, 0.2 + (avg_conf * 0.5) + (min(1.0, len(detections) / 8.0) * 0.3))

    return {
        "damage_score": round(damage_score, 2),
        "damage_category": category_info["category"],
        "damage_category_scale": "1=highest, 5=lowest",
        "risk_level": category_info["risk_level"],
        "estimated_economic_loss_inr": estimated_loss_inr,
        "estimated_economic_loss_inr_crore": round(estimated_loss_inr / 10_000_000, 2),
        "recommended_ndrf_teams": ndrf_teams_required,
        "affected_area_ratio": round(affected_area_ratio, 4),
        "assessment_confidence": round(assessment_confidence, 3),
        "assessment_note": "Calibrated rule-based estimate using class severity + box coverage + confidence. Decision support only.",
    }


def _predict_from_image(image: Image.Image) -> dict[str, Any]:
    results = model.predict(source=image, verbose=False)

    response = {"predictions": []}

    for res in results:
        names = res.names if hasattr(res, "names") else {}
        item: dict[str, Any] = {}
        detections: list[dict[str, Any]] = []
        classification: dict[str, Any] | None = None

        image_height = None
        image_width = None
        if hasattr(res, "orig_shape") and res.orig_shape is not None and len(res.orig_shape) >= 2:
            image_height = float(res.orig_shape[0])
            image_width = float(res.orig_shape[1])
        image_area = (image_width or 0.0) * (image_height or 0.0)

        if hasattr(res, "boxes") and res.boxes is not None and len(res.boxes) > 0:
            for box in res.boxes:
                cls_id = int(_to_python(box.cls[0])) if box.cls is not None else -1
                conf = float(_to_python(box.conf[0])) if box.conf is not None else None
                coords = [float(v) for v in box.xyxy[0].tolist()] if box.xyxy is not None else None
                bbox_area_ratio = None
                if coords is not None and image_area > 0:
                    width = max(0.0, coords[2] - coords[0])
                    height = max(0.0, coords[3] - coords[1])
                    bbox_area_ratio = max(0.0, min(1.0, (width * height) / image_area))
                detections.append(
                    {
                        "class_id": cls_id,
                        "class_name": names.get(cls_id, str(cls_id)) if isinstance(names, dict) else str(cls_id),
                        "confidence": conf,
                        "bbox_xyxy": coords,
                        "bbox_area_ratio": round(bbox_area_ratio, 6) if bbox_area_ratio is not None else None,
                    }
                )
            item["detections"] = detections

        if hasattr(res, "probs") and res.probs is not None:
            top1 = int(_to_python(res.probs.top1)) if hasattr(res.probs, "top1") else None
            top1conf = float(_to_python(res.probs.top1conf)) if hasattr(res.probs, "top1conf") else None
            classification = {
                "top1_class_id": top1,
                "top1_class_name": names.get(top1, str(top1)) if isinstance(names, dict) and top1 is not None else None,
                "top1_confidence": top1conf,
            }
            item["classification"] = classification

        item["assessment"] = _build_assessment(detections=detections, classification=classification)

        response["predictions"].append(item)

    return response


@app.before_request
def log_request_start() -> None:
    g.request_start = time.perf_counter()
    logger.info("Request started: %s %s", request.method, request.path)


@app.after_request
def log_request_end(response: Any) -> Any:
    started = getattr(g, "request_start", None)
    elapsed_ms = (time.perf_counter() - started) * 1000 if started is not None else 0.0
    logger.info("Request completed: %s %s -> %s (%.2f ms)", request.method, request.path, response.status_code, elapsed_ms)
    return response


@app.get("/")
def root() -> Any:
    return jsonify({
        "service": "terascope-ai-api",
        "status": "ok",
        "endpoints": {
            "health": "GET /health",
            "predict": "POST /predict (multipart/form-data: image)",
            "predict_url": "POST /predict_url ({\"image_url\": \"...\"})",
        },
    })


@app.get("/health")
def health() -> Any:
    return jsonify({
        "status": "ok",
        "model_path": str(MODEL_PATH),
        "model_loaded": True,
    })


@app.post("/predict")
def predict() -> Any:
    if "image" not in request.files:
        logger.warning("/predict failed: missing 'image' field in multipart form")
        return jsonify({"error": "No image file provided. Use multipart/form-data with field 'image'."}), 400

    uploaded = request.files["image"]
    if uploaded.filename == "":
        logger.warning("/predict failed: empty filename")
        return jsonify({"error": "Empty filename."}), 400

    try:
        image = Image.open(uploaded.stream).convert("RGB")
    except Exception as exc:
        logger.exception("/predict failed: invalid image file")
        return jsonify({"error": f"Invalid image file: {exc}"}), 400

    prediction = _predict_from_image(image)
    logger.info("/predict succeeded: generated %d prediction batch(es)", len(prediction.get("predictions", [])))
    return jsonify(prediction)


@app.post("/predict_url")
def predict_url() -> Any:
    payload = request.get_json(silent=True) or {}
    image_url = str(payload.get("image_url") or "").strip()
    if not image_url:
        logger.warning("/predict_url failed: missing image_url in JSON body")
        return jsonify({"error": "Provide JSON body with image_url."}), 400

    try:
        req = Request(
            image_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
                "Accept": "image/*,*/*;q=0.8",
            },
        )
        with urlopen(req, timeout=15) as response:
            content_type = (response.headers.get("Content-Type", "") or "").lower()
            raw = response.read()
            if "image" not in content_type and not raw:
                return jsonify({"error": f"URL did not return image data. Content-Type: {content_type or 'unknown'}"}), 400
        image = Image.open(BytesIO(raw)).convert("RGB")
    except URLError as exc:
        logger.exception("/predict_url failed: URL fetch error")
        return jsonify({"error": f"Failed to fetch image URL: {exc}"}), 400
    except Exception as exc:
        logger.exception("/predict_url failed: invalid image from URL")
        return jsonify({"error": f"Invalid image from URL: {exc}"}), 400

    response = _predict_from_image(image)
    response["source"] = {"type": "url", "image_url": image_url}
    logger.info("/predict_url succeeded: generated %d prediction batch(es)", len(response.get("predictions", [])))
    return jsonify(response)


if __name__ == "__main__":
    logger.info("Starting server on %s:%s", HOST, PORT)
    app.run(host=HOST, port=PORT)
