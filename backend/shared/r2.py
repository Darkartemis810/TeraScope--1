"""Shared Cloudflare R2 client using boto3."""
import os
import boto3
from botocore.client import Config
from dotenv import load_dotenv

load_dotenv()

def get_r2_client():
    account_id = os.getenv("CF_ACCOUNT_ID")
    if not account_id:
        raise RuntimeError("CF_ACCOUNT_ID not set. Configure terra/SENTINEL_API_KEYS.env → rename to .env")
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )

def upload_bytes(key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """Upload bytes to R2 and return the public URL."""
    bucket = os.getenv("R2_BUCKET_NAME", "sentinel-media")
    client = get_r2_client()
    client.put_object(
        Bucket=bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    public_domain = os.getenv("R2_PUBLIC_DOMAIN", "")
    return f"{public_domain}/{key}" if public_domain else f"r2://{bucket}/{key}"

def get_public_url(key: str) -> str:
    public_domain = os.getenv("R2_PUBLIC_DOMAIN", "")
    bucket = os.getenv("R2_BUCKET_NAME", "sentinel-media")
    return f"{public_domain}/{key}" if public_domain else f"r2://{bucket}/{key}"
