import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader, Minimize2 } from 'lucide-react';

const SYSTEM_PROMPT = `You are TeraScope AI — a civilian disaster safety assistant. You help people stay safe during disasters.

Your context:
- You assist civilians in disaster zones with safety information
- You provide shelter locations, escape routes, weather info, and emergency guidance
- Be concise, calm, and reassuring. Lives may depend on clarity.
- If asked about medical emergencies, advise calling 911 immediately
- Never provide false or speculative information
- If unsure, say "I'm not certain — please contact emergency services at 911"

Current guidelines:
- Keep responses under 150 words
- Use bullet points for instructions
- Prioritize life-safety information`;

const FALLBACK_RESPONSES = [
  "I'm currently unable to connect to the AI service. For immediate help, call **911** or your local emergency number.",
  "Connection issue detected. Here are key emergency numbers:\n- **Emergency**: 911\n- **FEMA**: 1-800-621-3362\n- **Red Cross**: 1-800-733-2767",
  "I can't reach the server right now. If you're in danger, **move to higher ground** and **call 911** immediately.",
];

const CivilianChatbot = ({ userLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m TeraScope AI. I can help you with shelter info, escape routes, weather updates, and safety guidance. How can I help you stay safe?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('No API key');

      const locationContext = userLocation
        ? `User is located at coordinates: ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}.`
        : 'User location is unknown.';

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + locationContext }] },
              { role: 'model', parts: [{ text: 'Understood. I\'m ready to assist with disaster safety.' }] },
              ...messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
              { role: 'user', parts: [{ text }] },
            ],
          }),
        }
      );

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I couldn\'t process that. Please try again or call 911 for emergencies.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-full bg-plasma text-void shadow-[0_0_25px_rgba(0,229,255,0.5)] hover:shadow-[0_0_40px_rgba(0,229,255,0.7)] transition-all hover:scale-105 flex items-center justify-center"
          aria-label="Open AI chat assistant">
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[1000] w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-graphite border border-plasma/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
             role="dialog" aria-label="TeraScope AI Chat">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-ghost/10 bg-void/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-plasma/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-plasma" />
              </div>
              <div>
                <h3 className="text-sm font-sora font-semibold text-ghost">TeraScope AI</h3>
                <p className="text-[10px] font-mono text-ghost/30">Disaster Safety Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-ghost/10 rounded-lg transition-colors" aria-label="Close chat">
              <X className="w-4 h-4 text-ghost/50" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-plasma/20' : 'bg-ghost/10'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-plasma" /> : <Bot className="w-3.5 h-3.5 text-ghost/50" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm font-mono leading-relaxed ${msg.role === 'user' ? 'bg-plasma/15 text-ghost' : 'bg-void text-ghost/80 border border-ghost/5'}`}>
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-1' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-ghost/10 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-ghost/50" />
                </div>
                <div className="bg-void rounded-xl px-3 py-2 border border-ghost/5">
                  <Loader className="w-4 h-4 text-plasma animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-ghost/10">
            <div className="flex gap-2">
              <input ref={inputRef} type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about safety, shelters, routes..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-void border border-ghost/10 text-sm font-mono text-ghost placeholder:text-ghost/20 focus:border-plasma/50 focus:outline-none transition-colors"
                aria-label="Type your message"
                disabled={loading}
              />
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                className="px-3 py-2.5 rounded-xl bg-plasma text-void hover:bg-plasma/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Send message">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] font-mono text-ghost/20 mt-1.5 text-center">Powered by Gemini AI • For emergencies, call 911</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CivilianChatbot;
