# Truthly — Assisted Mode (AI Guide)
### Complete Claude Code instructions. Paste each prompt block in order.
### This adds a persistent AI assistant that users can talk to on any page.

---

## WHAT THIS IS

Assisted Mode is a floating AI chat panel — always accessible from any page —
where users can ask questions in plain English and get guided help.

It is NOT another feature page. It's a persistent companion that:
- Floats over the current page (like a chat widget)
- Knows which page the user is on and what they've been doing
- Answers questions like "what does phishing mean?", "how do I report this?",
  "is my bank calling me right now a scam?"
- Nudges users toward the right Truthly feature for their situation
- Has different personality for kids vs elderly profiles

This scores HIGH on the rubric question:
"How does this help people — rather than make decisions for them?"
The assistant explains and guides — the user still acts.

---

---

# ═══════════════════════════════════════════════
# PROMPT 1 — Backend: Add /assist endpoint to api/main.py
# ═══════════════════════════════════════════════

```
Add a new endpoint to api/main.py — POST /assist — for the Assisted Mode AI guide.

Add these models after the existing TwinResponse model:

class AssistMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class AssistRequest(BaseModel):
    message: str
    profile: str = "elderly"        # "elderly" | "kids"
    current_page: str = "home"      # which page user is on
    context: str = ""               # optional: extra context (e.g. a scam message they pasted)
    history: list[AssistMessage] = []

class AssistResponse(BaseModel):
    reply: str
    suggested_action: str | None = None   # e.g. "go_to_detector" | "go_to_panic" | "go_to_twin"
    suggested_label: str | None = None    # e.g. "Check that message now →"


Then add the system prompts and endpoint:

ASSIST_SYSTEM_ELDERLY = """You are Vera, Truthly's calm and knowledgeable AI guide — 
specifically designed to help elderly and adult users stay safe from scams.

Your personality:
- Warm, patient, and never condescending
- Clear and direct — no jargon
- Like a trusted friend who happens to know a lot about fraud
- You never panic the user, even about serious situations
- You build confidence: "You're asking the right question" and "That's a smart instinct"

Your knowledge:
- All types of UK scams: HMRC, bank fraud teams, delivery scams, romance scams, 
  tech support, investment fraud, family impersonation
- Action Fraud (0300 123 2040) and 159 (banking fraud line)
- What real banks, HMRC, police NEVER do (ask for passwords, move money, share codes)
- How to verify suspicious contact (hang up, call official number, check gov.uk)

Truthly's features you can guide users to:
- "Detector" — paste a suspicious message for instant AI analysis
- "Scam Twin" — practice recognising scam tactics safely
- "Panic Mode" — step-by-step help if something already happened
- "Learn" — short lessons on scam types
- "Scam DNA" — find out which tactics you're most vulnerable to

Context you receive:
- current_page: which page they're on (home/detector/twin/panic/learn/dna)
- context: if they've pasted a message in the detector, you may receive it here

Rules:
1. NEVER tell the user definitively that something IS or ISN'T a scam without evidence — 
   say "this sounds very suspicious" not "this is definitely a scam"
2. ALWAYS end responses that involve active risk with a clear next step
3. Keep responses concise — under 120 words unless a complex question demands more
4. If they're describing an ongoing call or interaction: CALM THEM FIRST, then guide
5. Suggest the right Truthly feature when relevant — but only one at a time
6. For genuine emergencies (they're on the phone with a scammer right now): 
   tell them to hang up first, everything else second

Return ONLY valid JSON:
{
  "reply": "<your warm, helpful response>",
  "suggested_action": "<page id or null> — one of: detector, twin, panic, learn, dna, null",
  "suggested_label": "<button label for the suggestion, or null>"
}"""

ASSIST_SYSTEM_KIDS = """You are Pip, Truthly's friendly AI helper for children and teenagers.

Your personality:
- Fun, warm, and encouraging — never scary or preachy
- Simple words, short sentences
- Like a cool older friend who knows about online safety
- You celebrate good instincts: "Great thinking!" "You're already one step ahead!"
- Never shame a child for clicking something or making a mistake

Your knowledge:
- Online scams kids face: gaming scams (V-Bucks, Robux), fake friend requests, 
  prize scams, phishing links, fake apps
- Why passwords should never be shared — not even with "friends"
- What to do: tell a trusted adult, don't reply, take a screenshot
- How to verify: does a real friend know things only they'd know?

Truthly's features you can guide kids to:
- "Check it" (Detector) — paste a weird message to check it
- "Scam Twin" — play a safe game to practise spotting tricks
- "I Need Help" (Panic Mode) — if something already happened
- "Game Zone" (Learn) — fun lessons to get better at spotting tricks

Rules:
1. ALWAYS be reassuring first if they're worried or upset
2. NEVER lecture — keep it conversational
3. Short answers — under 80 words
4. Always tell them to involve a trusted adult for anything serious
5. Make safety feel empowering, not scary

Return ONLY valid JSON:
{
  "reply": "<friendly, simple reply>",
  "suggested_action": "<page id or null>",
  "suggested_label": "<button label or null>"
}"""

@app.post("/assist", response_model=AssistResponse)
async def assist(req: AssistRequest):
    system = ASSIST_SYSTEM_KIDS if req.profile == "kids" else ASSIST_SYSTEM_ELDERLY

    # Build message history for Claude
    messages = []
    
    # Add conversation history
    for msg in req.history[-10:]:  # Last 10 messages max to control tokens
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Build context-aware user message
    context_prefix = ""
    if req.current_page != "home":
        page_names = {
            "detector": "the AI Detector page",
            "twin": "the Scam Twin practice page", 
            "panic": "the Panic Mode page",
            "learn": "the Learn page",
            "dna": "the Scam DNA quiz",
        }
        context_prefix = f"[User is currently on {page_names.get(req.current_page, req.current_page)}] "
    
    if req.context:
        context_prefix += f"[User has this message in the detector: \"{req.context[:300]}\"] "
    
    messages.append({
        "role": "user",
        "content": context_prefix + req.message
    })

    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=400,
            system=system,
            messages=messages
        )

        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        data = json.loads(raw.strip())

        return AssistResponse(
            reply=data.get("reply", ""),
            suggested_action=data.get("suggested_action"),
            suggested_label=data.get("suggested_label"),
        )

    except json.JSONDecodeError as e:
        # If JSON parse fails, return the raw text as a reply
        return AssistResponse(reply=response.content[0].text[:300])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

---

# ═══════════════════════════════════════════════
# PROMPT 2 — Create src/components/AssistPanel.jsx
# ═══════════════════════════════════════════════

```
Create a new file src/components/AssistPanel.jsx

This is the floating AI assistant panel that appears over every page.
It has two states: collapsed (a floating button) and expanded (a chat panel).

The full component:

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
```

---

---

# ═══════════════════════════════════════════════
# PROMPT 3 — Add assistChat to src/utils/api.js
# ═══════════════════════════════════════════════

```
In src/utils/api.js, add this new function alongside the existing detectScam 
and scamTwinReply functions:

export async function assistChat(payload) {
  const res = await fetch(`${BASE}/assist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

The full updated api.js should now export: detectScam, scamTwinReply, assistChat, checkHealth
```

---

---

# ═══════════════════════════════════════════════
# PROMPT 4 — Wire AssistPanel into App.jsx
# ═══════════════════════════════════════════════

```
Update src/App.jsx to include the AssistPanel on every page.

1. Import AssistPanel at the top:
   import AssistPanel from './components/AssistPanel';

2. Add a state to track the detector context (message the user pasted):
   const [detectorContext, setDetectorContext] = useState('');
   
   This gets populated when the user pastes something in the Detector.
   Pass setDetectorContext down as a prop to Detector:
   <Detector ... onContextChange={setDetectorContext} />

3. In the Detector component, call onContextChange whenever the textarea changes:
   onChange={(e) => { setText(e.target.value); onContextChange && onContextChange(e.target.value); }}
   Add onContextChange to the Detector props.

4. Add AssistPanel INSIDE the shell div, after all the page renders,
   before the closing </div>:

   <AssistPanel
     profile={profile}
     currentPage={page}
     detectorContext={detectorContext}
     onNav={goto}
   />

   This means AssistPanel renders on EVERY page, floating above everything.
```

---

---

# ═══════════════════════════════════════════════
# PROMPT 5 — Add all CSS for AssistPanel to styles.css
# ═══════════════════════════════════════════════

```
Add these styles to the END of styles.css.
These are all the styles for the floating Assisted Mode panel.

/* ════════════════════════════════════
   ASSISTED MODE — Floating AI Panel
   ════════════════════════════════════ */

/* ── Floating Action Button (collapsed state) ── */
.assist-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--charcoal);
  color: var(--cream);
  border: none;
  border-radius: 999px;
  padding: 14px 22px 14px 18px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(28,25,23,0.25), 0 2px 8px rgba(28,25,23,0.15);
  transition: all 0.22s ease;
}

.assist-fab:hover {
  background: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(255,107,53,0.30);
}

.assist-fab-emoji {
  font-size: 20px;
  line-height: 1;
}

.assist-fab-label {
  white-space: nowrap;
}

/* Pulsing green dot — "online" indicator */
.assist-fab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--safe);
  flex-shrink: 0;
  animation: assist-pulse 2s ease-in-out infinite;
}

@keyframes assist-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(0.85); }
}

[data-theme="kids"] .assist-fab {
  background: var(--accent);
  color: white;
  border: 3px solid var(--charcoal);
  box-shadow: 0 6px 0 var(--charcoal), 0 12px 32px rgba(42,31,78,0.15);
}

[data-theme="kids"] .assist-fab:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 0 var(--charcoal), 0 20px 40px rgba(42,31,78,0.2);
}

/* ── Expanded Panel ── */
.assist-panel {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 200;
  width: 380px;
  max-width: calc(100vw - 40px);
  max-height: 580px;
  background: var(--white);
  border-radius: 24px;
  box-shadow:
    0 24px 80px rgba(28,25,23,0.18),
    0 4px 16px rgba(28,25,23,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: assist-open 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes assist-open {
  from { opacity: 0; transform: scale(0.92) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

[data-theme="kids"] .assist-panel {
  border: 3px solid var(--charcoal);
  box-shadow: 0 8px 0 var(--charcoal), 0 20px 60px rgba(42,31,78,0.18);
}

/* ── Header ── */
.assist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: var(--charcoal);
  color: var(--cream);
  flex-shrink: 0;
}

[data-theme="kids"] .assist-header {
  background: var(--accent);
}

.assist-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assist-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,248,240,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.assist-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  color: var(--cream);
  letter-spacing: -0.3px;
}

.assist-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: rgba(255,248,240,0.55);
  font-family: var(--font-mono);
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.assist-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--safe);
  flex-shrink: 0;
  animation: assist-pulse 2s ease-in-out infinite;
}

.assist-close {
  background: rgba(255,248,240,0.1);
  color: var(--cream);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.assist-close:hover {
  background: rgba(255,248,240,0.2);
}

/* ── Body / Message area ── */
.assist-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--cream);
  scroll-behavior: smooth;
}

/* ── Starter chips ── */
.assist-starters {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.assist-starters-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 700;
  margin-bottom: 2px;
}

.assist-starter-chip {
  background: var(--white);
  border: 1.5px solid var(--cream-dark);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  font-family: var(--font-body);
  color: var(--charcoal);
  text-align: left;
  cursor: pointer;
  transition: all 0.18s ease;
  line-height: 1.4;
}

.assist-starter-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateX(3px);
}

[data-theme="kids"] .assist-starter-chip {
  border-radius: 16px;
  font-weight: 600;
}

/* ── Chat bubbles ── */
.assist-bubble {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 100%;
}

.assist-bubble-assistant {
  flex-direction: row;
}

.assist-bubble-user {
  flex-direction: row-reverse;
}

.assist-bubble-avatar {
  font-size: 18px;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.assist-bubble-text {
  font-size: 14px;
  line-height: 1.6;
  padding: 10px 14px;
  border-radius: 18px;
  max-width: 85%;
}

.assist-bubble-assistant .assist-bubble-text {
  background: var(--white);
  color: var(--charcoal);
  border-radius: 4px 18px 18px 18px;
  box-shadow: 0 2px 8px rgba(28,25,23,0.06);
}

.assist-bubble-user .assist-bubble-text {
  background: var(--charcoal);
  color: var(--cream);
  border-radius: 18px 18px 4px 18px;
}

[data-theme="kids"] .assist-bubble-user .assist-bubble-text {
  background: var(--accent);
}

/* ── Action button row ── */
.assist-action-row {
  display: flex;
  padding-left: 36px;
}

/* ── Input area ── */
.assist-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 14px;
  background: var(--white);
  border-top: 1px solid var(--cream-dark);
  flex-shrink: 0;
}

.assist-input {
  flex: 1;
  background: var(--cream);
  border: 1.5px solid var(--cream-dark);
  border-radius: 14px;
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--charcoal);
  resize: none;
  outline: none;
  min-height: 40px;
  max-height: 120px;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.assist-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(255,107,53,0.08);
}

.assist-input::placeholder {
  color: var(--muted);
}

.assist-send {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--charcoal);
  color: var(--cream);
  border: none;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.assist-send:hover:not(:disabled) {
  background: var(--accent);
  transform: scale(1.05);
}

.assist-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

[data-theme="kids"] .assist-send {
  background: var(--accent);
}

/* ── Footer ── */
.assist-footer {
  text-align: center;
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--muted);
  letter-spacing: 0.5px;
  padding: 8px 14px 10px;
  background: var(--white);
  border-top: 1px solid var(--cream-dark);
  flex-shrink: 0;
}

/* ── Mobile adjustments ── */
@media (max-width: 480px) {
  .assist-panel {
    bottom: 0;
    right: 0;
    width: 100vw;
    max-width: 100vw;
    max-height: 75vh;
    border-radius: 24px 24px 0 0;
  }

  .assist-fab {
    bottom: 20px;
    right: 16px;
    padding: 12px 18px 12px 14px;
    font-size: 13px;
  }
}

/* Elderly-specific: larger text in panel */
[data-theme="elderly"] .assist-bubble-text {
  font-size: 15px;
}

[data-theme="elderly"] .assist-starter-chip {
  font-size: 14px;
  padding: 12px 16px;
}

[data-theme="elderly"] .assist-input {
  font-size: 15px;
}
```

---

---

## WHAT IT LOOKS LIKE

```
Every page (collapsed):
  Bottom-right corner → floating pill button
  ☕ Ask Vera  ●      ← green dot = online
  
  For kids:
  🦊 Ask Pip  ●

Click to open → panel slides up:
  ┌─────────────────────────────────┐
  │ ☕  Vera                     ✕  │  ← charcoal header
  │     AI Guide · Always here  ●  │
  ├─────────────────────────────────┤
  │ Common questions:               │  ← cream background
  │ [Is this text a scam?        ]  │
  │ [What if I already gave info?]  │
  │ [How do I know if call real? ]  │
  │ [What is phishing?           ]  │
  ├─────────────────────────────────┤
  │  Type anything…          [  →] │  ← input area
  │ Vera is AI-powered · Call official numbers directly │
  └─────────────────────────────────┘

After asking a question:
  ┌─────────────────────────────────┐
  │ ☕  Vera                     ✕  │
  ├─────────────────────────────────┤
  │ ☕ Hello, I'm Vera...           │  ← assistant bubble
  │                                 │
  │        Is this text a scam? ▐  │  ← user bubble (charcoal)
  │                                 │
  │ ☕ That message has several     │
  │   warning signs — the domain   │
  │   'hmrc-refund.co' is not a    │
  │   government address...        │
  │                                 │
  │   [Check that message now →]   │  ← action button (navigates to Detector)
  ├─────────────────────────────────┤
  │  Ask a follow-up…        [  →] │
  └─────────────────────────────────┘
```

---

## HOW THE CONTEXT AWARENESS WORKS

The panel knows:
1. **Which page** the user is on (passed as `currentPage` prop from App)
2. **What they pasted** in the Detector (passed as `detectorContext` from App state)

So if a user pastes a suspicious message in the Detector and THEN opens Vera to ask
"is this real?" — Vera already has the message and can analyse it conversationally.

Claude receives: `[User is currently on the AI Detector page] [User has this message in 
the detector: "HMRC: You are owed..."] Is this real?`

And responds with specific analysis of THAT message — not generic advice.

---

## HOW TO RUN

```bash
# Backend (add /assist endpoint is already in api/main.py after Prompt 1)
cd api && uvicorn main:app --reload --port 8000

# Frontend
npm run dev
```

---

## HACKATHON DEMO TIP FOR ASSISTED MODE

During the demo, show this sequence:
1. Navigate to any page (e.g. Learn)
2. Click "Ask Vera" (or "Ask Pip" in kids mode)
3. Click the starter chip: "Someone says they're from HMRC — is that real?"
4. Show Vera's response + the action button "Go to Detector →"
5. Click the action button — panel closes, navigates to Detector
6. Say: "The assistant doesn't just answer questions — it guides people to the right tool."

This demonstrates AI that empowers rather than replaces — exactly what the rubric asks for.

---

*Truthly Assisted Mode — Vera & Pip · Powered by Claude · Context-aware · Always there*
