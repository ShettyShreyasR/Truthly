import { useState, useRef, useEffect } from 'react';
import { assistChat } from '../utils/api';

// Starter suggestions shown before the user types anything
const STARTERS_ELDERLY = [
  "Is this text message a scam?",
  "What should I do if I already gave my details?",
  "How do I know if a bank call is real?",
  "What is phishing?",
  "Someone says they're from HMRC — is that real?",
];

const STARTERS_KIDS = [
  "Someone is asking for my password — what do I do?",
  "How do I know if a new friend online is real?",
  "I clicked a weird link — am I in trouble?",
  "What is a scam?",
  "Someone said I won a prize — is it real?",
];

export default function AssistPanel({ profile, currentPage, detectorContext, onNav }) {
  const isKids = profile === 'kids';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);  // { role: 'user'|'assistant', content: string }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const starters = isKids ? STARTERS_KIDS : STARTERS_ELDERLY;
  const assistantName = isKids ? 'Pip' : 'Vera';
  const assistantEmoji = isKids ? '🦊' : '☕';

  // Auto-scroll on new message
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Show greeting when first opened
  const handleOpen = () => {
    setOpen(true);
    if (!hasGreeted) {
      setHasGreeted(true);
      const greeting = isKids
        ? `Hi! I'm Pip 🦊 I'm here to help you stay safe online. What's on your mind?`
        : `Hello, I'm Vera. I'm here to help you navigate anything suspicious or confusing — no question is too simple. What can I help you with?`;
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  };

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const data = await assistChat({
        message: trimmed,
        profile,
        current_page: currentPage,
        context: detectorContext || '',
        history: messages.slice(-10), // last 10 for context
      });

      const assistMsg = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistMsg]);

      // If Claude suggests an action, show it as a button
      if (data.suggested_action && data.suggested_label) {
        setMessages(prev => [...prev, {
          role: 'action',
          action: data.suggested_action,
          label: data.suggested_label,
        }]);
      }

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isKids
          ? "Oops! I had a little hiccup. Try asking me again!"
          : "Sorry, I had a connection issue. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleStarter = (s) => send(s);

  const handleAction = (action) => {
    onNav(action);
    setOpen(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* ── Collapsed: floating button ── */}
      {!open && (
        <button
          className="assist-fab"
          onClick={handleOpen}
          aria-label="Open AI assistant"
        >
          <span className="assist-fab-emoji">{assistantEmoji}</span>
          <span className="assist-fab-label">
            {isKids ? 'Ask Pip' : 'Ask Vera'}
          </span>
          <span className="assist-fab-dot" />
        </button>
      )}

      {/* ── Expanded: chat panel ── */}
      {open && (
        <div className="assist-panel">
          {/* Header */}
          <div className="assist-header">
            <div className="assist-header-left">
              <div className="assist-avatar">{assistantEmoji}</div>
              <div>
                <div className="assist-name">{assistantName}</div>
                <div className="assist-status">
                  <span className="assist-status-dot" />
                  {isKids ? 'Your safety helper' : 'AI Guide · Always here'}
                </div>
              </div>
            </div>
            <button className="assist-close" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="assist-body" ref={bodyRef}>

            {/* Starter chips — show before any user message */}
            {messages.length <= 1 && (
              <div className="assist-starters">
                <div className="assist-starters-label">
                  {isKids ? 'Try asking:' : 'Common questions:'}
                </div>
                {starters.map((s, i) => (
                  <button key={i} className="assist-starter-chip" onClick={() => handleStarter(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((m, i) => {
              if (m.role === 'action') {
                return (
                  <div key={i} className="assist-action-row">
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 13, padding: '10px 18px', minHeight: 'unset' }}
                      onClick={() => handleAction(m.action)}
                    >
                      {m.label}
                    </button>
                  </div>
                );
              }
              return (
                <div key={i} className={`assist-bubble assist-bubble-${m.role}`}>
                  {m.role === 'assistant' && (
                    <span className="assist-bubble-avatar">{assistantEmoji}</span>
                  )}
                  <div className="assist-bubble-text">{m.content}</div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="assist-bubble assist-bubble-assistant">
                <span className="assist-bubble-avatar">{assistantEmoji}</span>
                <div className="assist-bubble-text">
                  <div className="typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="assist-input-row">
            <textarea
              ref={inputRef}
              className="assist-input"
              placeholder={isKids
                ? "Ask me anything about staying safe…"
                : "Ask me anything — no question is too simple…"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              className="assist-send"
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              →
            </button>
          </div>

          {/* Footer note */}
          <div className="assist-footer">
            {isKids
              ? "Pip is AI-powered · Always tell a grown-up too"
              : "Vera is AI-powered · Always call official numbers directly"}
          </div>
        </div>
      )}
    </>
  );
}
