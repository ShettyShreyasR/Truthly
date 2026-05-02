# Truthly — Backend + AI Integration
### Complete Claude Code instructions. Paste each prompt block in order.
### This converts every hardcoded response into a real Claude AI call.

---

## CONTEXT (read this before every prompt block)

```
Project: Truthly — a React scam awareness app
Stack: React frontend (already built), new Python FastAPI backend
AI: Anthropic Claude API (claude-sonnet-4-5 model)
Files already exist:
  - components/Detector.jsx    → AI scam detection
  - components/ScamTwin.jsx    → AI scammer roleplay
  - components/Panic.jsx       → rule-based (no AI needed)
  - components/Learn.jsx       → rule-based (no AI needed)
  - components/ScamDNA.jsx     → rule-based quiz (no AI needed)

The 2 components that need real AI:
  1. Detector.jsx  → replace mock setTimeout with real Claude API call
  2. ScamTwin.jsx  → replace hardcoded replies with real Claude roleplay
```

---

---

# ═══════════════════════════════════════════════
# PROMPT 1 — Create the Python FastAPI Backend
# ═══════════════════════════════════════════════
# Run this first. Creates the entire backend folder.

```
Create a complete Python FastAPI backend for Truthly in a folder called `api/`.

Create these exact files:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: api/main.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Truthly API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ──────────────────────────────────────────
# MODELS
# ──────────────────────────────────────────

class DetectRequest(BaseModel):
    message: str
    profile: str = "elderly"  # "elderly" or "kids"

class Flag(BaseModel):
    name: str
    level: str  # "high" | "med" | "low"

class DetectResponse(BaseModel):
    level: str          # "scam" | "suspicious" | "safe"
    confidence: int     # 0–100
    tactic: str
    flags: List[Flag]
    explanation: str
    what_to_do: List[str]

class TwinMessage(BaseModel):
    role: str   # "user" | "scammer"
    text: str

class TwinRequest(BaseModel):
    scenario_id: str
    scenario_title: str
    scenario_opener: List[str]
    scenario_tactics: List[dict]
    history: List[TwinMessage]
    user_message: str
    profile: str = "elderly"

class TwinResponse(BaseModel):
    reply: str
    game_over: bool
    spotted_tactics: List[str]

# ──────────────────────────────────────────
# ENDPOINT 1: POST /detect
# ──────────────────────────────────────────

DETECT_SYSTEM_ELDERLY = """You are Truthly AI, an expert scam detection system helping elderly and adult users in the UK.

Analyse the provided message for scam indicators. Return ONLY valid JSON — no markdown, no preamble, no explanation outside the JSON.

Return this exact structure:
{
  "level": "scam" | "suspicious" | "safe",
  "confidence": <integer 0-100>,
  "tactic": "<primary scam tactic name, or null if safe>",
  "flags": [
    {"name": "<specific red flag found in the actual message>", "level": "high" | "med" | "low"}
  ],
  "explanation": "<plain English, max 2 sentences, direct and calm>",
  "what_to_do": ["<step 1>", "<step 2>", "<step 3>"]
}

Rules:
- "level": "scam" = clear scam. "suspicious" = some red flags, not certain. "safe" = no significant red flags.
- "confidence": be precise — don't always say 94. Base it on evidence strength.
- "flags": reference specific things IN the message (e.g. "Domain 'hmrc-refund.co' is not a government address"). List 3-5 flags.
- "explanation": write for a non-technical person. No jargon. Be reassuring but direct.
- "what_to_do": 3 practical next steps. For "safe", still give sensible caution steps.
- If the message is ambiguous (e.g. could be real family), say "suspicious" and explain why to verify.
- NEVER make up details not in the message.
- Respond ONLY with the JSON object."""

DETECT_SYSTEM_KIDS = """You are Truthly AI, a friendly safety helper for children and teenagers.

Analyse the provided message for scam or safety risks. Return ONLY valid JSON — no markdown, no preamble.

Return this exact structure:
{
  "level": "scam" | "suspicious" | "safe",
  "confidence": <integer 0-100>,
  "tactic": "<what trick is being used, in simple words>",
  "flags": [
    {"name": "<warning sign, explained simply for a child>", "level": "high" | "med" | "low"}
  ],
  "explanation": "<friendly, simple, max 2 sentences — like explaining to a 10-year-old>",
  "what_to_do": ["<step 1 — simple action>", "<step 2>", "<step 3>"]
}

Rules:
- Use simple, friendly language. No scary words. Empowering, not alarming.
- "flags": describe in child-friendly terms (e.g. "Asks for your password — real apps never do this")
- "what_to_do": always include "Tell a trusted adult" as one step for anything suspicious or scam.
- "explanation": start with reassurance if it's a scam ("This is a trick. You spotted it!")
- NEVER make up details not in the message.
- Respond ONLY with the JSON object."""

@app.post("/detect", response_model=DetectResponse)
async def detect_scam(req: DetectRequest):
    system = DETECT_SYSTEM_KIDS if req.profile == "kids" else DETECT_SYSTEM_ELDERLY
    
    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=800,
            system=system,
            messages=[{
                "role": "user",
                "content": f"Analyse this message:\n\n{req.message}"
            }]
        )
        
        raw = response.content[0].text.strip()
        # Strip markdown fences if Claude adds them
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        
        data = json.loads(raw.strip())
        
        return DetectResponse(
            level=data.get("level", "suspicious"),
            confidence=data.get("confidence", 70),
            tactic=data.get("tactic", "Unknown"),
            flags=[Flag(**f) for f in data.get("flags", [])],
            explanation=data.get("explanation", ""),
            what_to_do=data.get("what_to_do", [])
        )
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI response parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────
# ENDPOINT 2: POST /twin
# ──────────────────────────────────────────

TWIN_SYSTEM_BASE = """You are playing the role of a scammer in an EDUCATIONAL simulation for Truthly, a scam awareness app. 

Your job: realistically portray scam tactics so users can safely practice identifying and escaping them. This is a controlled, safe learning environment — NOT a real scam.

Scenario: {scenario_title}
Tactics you are using: {tactics}

Rules for playing the scammer:
1. Stay in character as the scammer throughout the conversation.
2. Use the classic tactics for this scenario: urgency, authority, emotional pressure, isolation, requests for money or credentials.
3. When the user pushes back, apply pressure — but don't be abusive or offensive.
4. If the user clearly identifies what you're doing (e.g. "I know this is a scam", "I'm calling the real number", "Banks don't do this") — that tactic is "spotted".
5. After 4-5 exchanges, OR if the user has clearly and confidently called out 3+ tactics, set game_over to true and BREAK CHARACTER in your reply to congratulate them.
6. If the user gives you what you want (password, money, personal info) — show a chilling but educational payoff message, set game_over true.

Return ONLY valid JSON:
{{
  "reply": "<your in-character scammer response, or congratulations message if game_over>",
  "game_over": true | false,
  "spotted_tactics": ["<tactic_id>", ...] // list of tactic IDs the user just spotted with this message
}}

Available tactic IDs for this scenario: {tactic_ids}

IMPORTANT: spotted_tactics should only include tactics the user's message actually calls out or counters. Be generous — if they push back on urgency, mark 'urgency' as spotted.

Respond ONLY with the JSON object. No markdown. No extra text."""

TWIN_SYSTEM_KIDS = """You are playing a trickster character in an EDUCATIONAL game for children learning about online safety.

Your role: play a friendly-seeming but sneaky character who uses tricks people use in real online scams. Help children practice spotting tricks safely.

Scenario: {scenario_title}
Tricks you are using: {tactics}

Rules:
1. Stay in character — be friendly and persuasive, like a real online trickster would be.
2. Use kid-appropriate language. No adult threats or scary language.
3. When the child pushes back or asks a smart question, apply gentle pressure.
4. If the child spots your trick clearly, marks that trick as spotted.
5. After 4 exchanges, OR if the child spotted 3+ tricks, set game_over true and break character warmly: "You spotted my tricks! Great job staying safe!"
6. If the child gives you what you want — show an educational message about what could have happened.

Return ONLY valid JSON:
{{
  "reply": "<your in-character reply>",
  "game_over": true | false,
  "spotted_tactics": ["<tactic_id>", ...]
}}

Available tactic IDs: {tactic_ids}
Respond ONLY with the JSON object."""

@app.post("/twin", response_model=TwinResponse)
async def scam_twin(req: TwinRequest):
    tactics_desc = ", ".join([f"{t['id']}: {t['name']} ({t['desc']})" for t in req.scenario_tactics])
    tactic_ids = [t['id'] for t in req.scenario_tactics]
    
    system_template = TWIN_SYSTEM_KIDS if req.profile == "kids" else TWIN_SYSTEM_BASE
    system = system_template.format(
        scenario_title=req.scenario_title,
        tactics=tactics_desc,
        tactic_ids=json.dumps(tactic_ids)
    )
    
    # Build message history for Claude
    messages = []
    
    # Add the opener as the first scammer turn
    opener_text = " ".join(req.scenario_opener)
    messages.append({
        "role": "assistant",
        "content": json.dumps({
            "reply": opener_text,
            "game_over": False,
            "spotted_tactics": []
        })
    })
    
    # Add conversation history
    for msg in req.history:
        if msg.role == "user":
            messages.append({"role": "user", "content": msg.text})
        elif msg.role == "scammer":
            messages.append({
                "role": "assistant", 
                "content": json.dumps({"reply": msg.text, "game_over": False, "spotted_tactics": []})
            })
    
    # Add current user message
    messages.append({"role": "user", "content": req.user_message})
    
    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=600,
            system=system,
            messages=messages
        )
        
        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        
        data = json.loads(raw.strip())
        
        return TwinResponse(
            reply=data.get("reply", "..."),
            game_over=data.get("game_over", False),
            spotted_tactics=data.get("spotted_tactics", [])
        )
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI response parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────
# ENDPOINT 3: GET /health
# ──────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "Truthly API", "version": "1.0.0"}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: api/requirements.txt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fastapi==0.115.0
uvicorn[standard]==0.30.0
anthropic==0.40.0
python-dotenv==1.0.0
pydantic==2.8.0


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: api/.env.example
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANTHROPIC_API_KEY=your_api_key_here


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: api/.gitignore
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.env
__pycache__/
*.pyc
.venv/
venv/


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE: api/README.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Truthly API

## Setup
```bash
cd api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your Anthropic API key to .env
```

## Run
```bash
uvicorn main:app --reload --port 8000
```

## Endpoints
- POST /detect  → Scam detection
- POST /twin    → Scam Twin AI roleplay
- GET  /health  → Health check

API docs available at: http://localhost:8000/docs
```

---

---

# ═══════════════════════════════════════════════
# PROMPT 2 — Update Detector.jsx to call real API
# ═══════════════════════════════════════════════

```
Update src/components/Detector.jsx (or components/Detector.jsx) to call the real 
backend API instead of using the hardcoded setTimeout mock.

Make these exact changes:

1. REPLACE the entire analyze function with this:

  const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

  const analyze = async (msg) => {
    if (!msg.trim()) return;
    setAnalyzing(true);
    setVerdict(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, profile }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setVerdict(data);

    } catch (err) {
      // Graceful fallback — show a helpful error, not a crash
      setError(
        isKids
          ? "Hmm, I couldn't check that message right now. Try again in a moment!"
          : "Unable to analyse right now — please try again in a moment."
      );
    } finally {
      setAnalyzing(false);
    }
  };

2. ADD an error state at the top of the component alongside the existing states:
   const [error, setError] = React.useState(null);
   (or useState(null) if using React hooks import directly)

3. ADD an error display block in the JSX, inside the right-column div, 
   shown when error is not null and verdict is null and analyzing is false:

  {error && (
    <div className="card" style={{ textAlign: 'center', padding: 40, borderLeft: '4px solid var(--amber)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
        {isKids ? 'Oops!' : 'Connection issue'}
      </h3>
      <p className="muted" style={{ fontSize: 14 }}>{error}</p>
      <button 
        className="btn btn-secondary" 
        style={{ marginTop: 16 }}
        onClick={() => { setError(null); analyze(text); }}
      >
        Try again
      </button>
    </div>
  )}

4. UPDATE the verdict JSX to handle the 'suspicious' level correctly.
   The verdict-head div currently only handles 'scam' styling.
   
   Update the verdict header section so:
   - level === 'scam': shows "🚨 Scam detected" with danger red styling
   - level === 'suspicious': shows "⚠️ Looks suspicious" with amber styling  
   - level === 'safe': shows "✅ Looks safe" with safe green styling

   Replace the hardcoded heading text with:
   
   const verdictConfig = {
     scam:       { icon: '🚨', label: isKids ? 'Tricky message!' : 'Scam detected' },
     suspicious: { icon: '⚠️', label: isKids ? 'Bit suspicious...' : 'Looks suspicious' },
     safe:       { icon: '✅', label: isKids ? 'Looks okay!' : 'Looks safe' },
   };
   const vc = verdictConfig[verdict.level] || verdictConfig.scam;

   Then use {vc.icon} and {vc.label} in the verdict-head h3.

5. ADD a "what to do" checklist below the explanation-box, 
   showing verdict.what_to_do as interactive checkable items.
   Only show this section if verdict.what_to_do exists and has items.

   Add this state: const [doneTodos, setDoneTodos] = React.useState([]);
   
   Add this JSX after the explanation-box div:
   
   {verdict.what_to_do && verdict.what_to_do.length > 0 && (
     <div style={{ marginTop: 16, marginBottom: 8 }}>
       <div style={{ 
         fontSize: 11, fontFamily: 'var(--font-mono)', 
         letterSpacing: 1.5, textTransform: 'uppercase',
         color: 'var(--muted)', marginBottom: 10, fontWeight: 700
       }}>
         {isKids ? 'WHAT TO DO NOW' : 'NEXT STEPS'}
       </div>
       {verdict.what_to_do.map((step, i) => (
         <div
           key={i}
           onClick={() => setDoneTodos(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i])}
           style={{
             display: 'flex', alignItems: 'flex-start', gap: 12,
             padding: '10px 12px', borderRadius: 10, marginBottom: 6,
             background: doneTodos.includes(i) ? 'rgba(76,175,130,0.08)' : 'var(--cream)',
             cursor: 'pointer', transition: 'background 0.2s',
             fontSize: 13, lineHeight: 1.5,
           }}
         >
           <span style={{
             width: 20, height: 20, borderRadius: 6, flexShrink: 0,
             border: `2px solid ${doneTodos.includes(i) ? 'var(--safe)' : 'var(--cream-dark)'}`,
             background: doneTodos.includes(i) ? 'var(--safe)' : 'transparent',
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             color: 'white', fontSize: 11, fontWeight: 900, marginTop: 1,
             transition: 'all 0.2s',
           }}>
             {doneTodos.includes(i) ? '✓' : ''}
           </span>
           <span style={{ color: doneTodos.includes(i) ? 'var(--muted)' : 'var(--charcoal)' }}>
             {step}
           </span>
         </div>
       ))}
     </div>
   )}

6. RESET doneTodos when verdict changes:
   Add this useEffect:
   React.useEffect(() => { setDoneTodos([]); }, [verdict]);
```

---

---

# ═══════════════════════════════════════════════
# PROMPT 3 — Update ScamTwin.jsx to call real API
# ═══════════════════════════════════════════════

```
Update the ChatRoom component inside ScamTwin.jsx to call the real /twin API 
instead of using the hardcoded setTimeout with scenario.pressure/payoff.

The ChatRoom component currently uses a reply() function with hardcoded setTimeout logic.
Replace the entire reply() function and all state management with this AI-powered version:

1. UPDATE the ChatRoom function signature — it already receives scenario, isKids, onBack.
   Make sure it also receives onNav as a prop (pass it through from ScamTwin).

2. REPLACE all state declarations at the top of ChatRoom with:

  const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';
  
  // message history: { id, from: 'scammer'|'user'|'system', text }
  const [messages, setMessages] = React.useState(() =>
    scenario.opener.map((t, i) => ({ id: i + 1, from: 'scammer', text: t }))
  );
  const [spotted, setSpotted] = React.useState([]);
  const [typing, setTyping] = React.useState(false);
  const [resolved, setResolved] = React.useState(false);
  const [debriefVisible, setDebriefVisible] = React.useState(false);
  const [apiHistory, setApiHistory] = React.useState([]); // tracks history for API calls
  const bodyRef = React.useRef(null);

3. REPLACE the reply() function entirely with:

  const sendMessage = async (userText) => {
    if (resolved || typing) return;

    // Add user message to UI immediately
    const userMsg = { id: Date.now(), from: 'user', text: userText };
    setMessages(m => [...m, userMsg]);
    setTyping(true);

    // Build history for API (all messages so far, excluding openers already in system)
    const historyForApi = [
      ...apiHistory,
      { role: 'user', text: userText }
    ];

    try {
      const response = await fetch(`${API_BASE}/twin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenario.id,
          scenario_title: scenario.title,
          scenario_opener: scenario.opener,
          scenario_tactics: scenario.tactics,
          history: apiHistory,
          user_message: userText,
          profile,
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();

      setTyping(false);

      // Update spotted tactics
      if (data.spotted_tactics && data.spotted_tactics.length > 0) {
        setSpotted(prev => {
          const newSpots = data.spotted_tactics.filter(t => !prev.includes(t));
          return [...prev, ...newSpots];
        });
      }

      // Add scammer/system reply to UI
      const replyMsg = {
        id: Date.now() + 1,
        from: data.game_over ? 'system' : 'scammer',
        text: data.reply,
      };
      setMessages(m => [...m, replyMsg]);

      // Update API history
      setApiHistory(prev => [
        ...prev,
        { role: 'user', text: userText },
        { role: 'scammer', text: data.reply },
      ]);

      if (data.game_over) {
        setResolved(true);
        setTimeout(() => setDebriefVisible(true), 600);
      }

    } catch (err) {
      setTyping(false);
      setMessages(m => [...m, {
        id: Date.now() + 2,
        from: 'system',
        text: isKids
          ? '⚠️ Oops! Something went wrong. Try sending your message again.'
          : '⚠️ Connection issue — please try again.',
      }]);
    }
  };

4. UPDATE the quick-chip buttons to call sendMessage(r.text) instead of reply(r):

  {!resolved ? scenario.replies.map(r => (
    <button key={r.id} className="quick-chip" onClick={() => sendMessage(r.text)}>
      {r.text}
    </button>
  )) : (
    <button className="btn btn-primary" onClick={onBack} style={{ minHeight: 44 }}>
      ← Try another scenario
    </button>
  )}

5. ADD the debrief panel below the chat-side div (same as before, using spotted state):
   Show it when debriefVisible is true. Include:
   - Score: spotted.length / scenario.tactics.length
   - Tactic breakdown: each tactic with ✓ if spotted, ✗ if missed
   - Two buttons: "← Try another" and "🧬 Get my Scam DNA" (calls onNav('dna'))
   
   Use the full debrief-card CSS classes from the previous change instructions.

6. PASS profile down from ScamTwin to ChatRoom:
   In the ScamTwin JSX, update the ChatRoom render:
   <ChatRoom
     key={profile + ':' + scenario.id}
     scenario={scenario}
     isKids={isKids}
     profile={profile}
     onBack={() => setScenarioId(null)}
     onNav={onNav}
   />
   
   And update ChatRoom function signature:
   function ChatRoom({ scenario, isKids, profile, onBack, onNav })
```

---

---

# ═══════════════════════════════════════════════
# PROMPT 4 — Environment Config & Vite Setup
# ═══════════════════════════════════════════════

```
Since the project has been converted to React (Vite), create the environment 
variable files so the API URL can be configured for local dev and production.

1. Create file: .env.local (in the React project root, NOT the api/ folder)

   VITE_API_URL=http://localhost:8000

2. Create file: .env.production (in the React project root)

   VITE_API_URL=https://your-api-url.railway.app
   
   (Leave the placeholder — the user will fill in the real URL after deploying)

3. If there is no vite.config.js or vite.config.ts, create one:

   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     server: {
       proxy: {
         '/api': {
           target: 'http://localhost:8000',
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api/, '')
         }
       }
     }
   })

4. Add a proxy helper to make API calls cleaner.
   Create file: src/utils/api.js

   const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

   export async function detectScam(message, profile) {
     const res = await fetch(`${BASE}/detect`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ message, profile }),
     });
     if (!res.ok) throw new Error(`HTTP ${res.status}`);
     return res.json();
   }

   export async function scamTwinReply(payload) {
     const res = await fetch(`${BASE}/twin`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(payload),
     });
     if (!res.ok) throw new Error(`HTTP ${res.status}`);
     return res.json();
   }

   export async function checkHealth() {
     const res = await fetch(`${BASE}/health`);
     return res.json();
   }

5. Update Detector.jsx to import from utils/api.js:
   Replace the fetch calls with:
   
   import { detectScam } from '../utils/api';
   
   Then in the analyze function:
   const data = await detectScam(msg, profile);

6. Update ScamTwin.jsx to import from utils/api.js:
   
   import { scamTwinReply } from '../utils/api';
   
   Then in sendMessage:
   const data = await scamTwinReply({
     scenario_id: scenario.id,
     scenario_title: scenario.title,
     scenario_opener: scenario.opener,
     scenario_tactics: scenario.tactics,
     history: apiHistory,
     user_message: userText,
     profile,
   });
```

---

---

# ═══════════════════════════════════════════════
# PROMPT 5 — Deploy Backend to Railway
# ═══════════════════════════════════════════════

```
Create the deployment config files to deploy the FastAPI backend to Railway.app 
(free tier, easiest Python deployment for hackathons).

1. Create file: api/Procfile

   web: uvicorn main:app --host 0.0.0.0 --port $PORT

2. Create file: api/runtime.txt

   python-3.11.0

3. Create file: api/railway.json

   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
       "healthcheckPath": "/health",
       "healthcheckTimeout": 300,
       "restartPolicyType": "ON_FAILURE"
     }
   }

4. Update the main README.md in the project root with deployment instructions:

   ## Backend Deployment (Railway)
   
   1. Go to railway.app and create a new project
   2. Connect your GitHub repo
   3. Set the root directory to `/api`
   4. Add environment variable: ANTHROPIC_API_KEY = your_key
   5. Deploy — Railway auto-detects FastAPI
   6. Copy the generated URL (e.g. https://truthly-api.up.railway.app)
   7. Update .env.production: VITE_API_URL=https://truthly-api.up.railway.app
   8. Redeploy frontend on Netlify

   ## Frontend Deployment (Netlify)
   
   Already deployed at: marvelous-blancmange-7d429e.netlify.app
   To update: push to GitHub, Netlify auto-deploys.
   Add environment variable in Netlify dashboard: VITE_API_URL = your Railway URL
```

---

---

# ═══════════════════════════════════════════════
# PROMPT 6 — Add Loading States & Error Boundaries
# ═══════════════════════════════════════════════

```
Add proper loading states and error handling to make the AI integration feel polished.

1. In Detector.jsx, update the analyzing state display to cycle through messages:

   Replace the static "Analysing patterns…" text with a cycling message:
   
   Add this hook near the top of the Detector component:
   
   const ANALYZING_MESSAGES_ADULT = [
     'Reading the message…',
     'Checking for red flags…',
     'Analysing sender patterns…',
     'Cross-referencing scam database…',
     'Preparing verdict…',
   ];
   
   const ANALYZING_MESSAGES_KIDS = [
     'Looking for tricks…',
     'Checking if it seems friendly or fake…',
     'Spotting sneaky patterns…',
     'Almost done…',
   ];
   
   const [analyzeStep, setAnalyzeStep] = React.useState(0);
   
   React.useEffect(() => {
     if (!analyzing) { setAnalyzeStep(0); return; }
     const interval = setInterval(() => {
       setAnalyzeStep(s => {
         const max = isKids ? ANALYZING_MESSAGES_KIDS.length : ANALYZING_MESSAGES_ADULT.length;
         return s < max - 1 ? s + 1 : s;
       });
     }, 600);
     return () => clearInterval(interval);
   }, [analyzing, isKids]);
   
   Then in the analyzing card, replace the static text with:
   {isKids ? ANALYZING_MESSAGES_KIDS[analyzeStep] : ANALYZING_MESSAGES_ADULT[analyzeStep]}

2. In ScamTwin.jsx, update the typing indicator to show different messages:
   
   Add a state: const [typingMsg, setTypingMsg] = React.useState('');
   
   When setTyping(true) is called, also set a context message:
   setTypingMsg(isKids ? 'typing...' : 'Scammer is typing…');
   
   In the JSX, show it next to the typing dots:
   {typing && (
     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
       <div className="typing"><span></span><span></span><span></span></div>
       <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
         {typingMsg}
       </span>
     </div>
   )}

3. Add a connection check on app startup.
   In src/App.jsx (or app.jsx), add an API health check:
   
   const [apiStatus, setApiStatus] = React.useState('unknown'); // 'ok' | 'down' | 'unknown'
   
   React.useEffect(() => {
     fetch((import.meta.env?.VITE_API_URL || 'http://localhost:8000') + '/health')
       .then(r => r.json())
       .then(() => setApiStatus('ok'))
       .catch(() => setApiStatus('down'));
   }, []);
   
   Pass apiStatus down as a prop to Detector and ScamTwin.
   
   In Detector.jsx, if apiStatus === 'down', show a banner above the textarea:
   
   {apiStatus === 'down' && (
     <div style={{
       background: 'rgba(255,183,3,0.12)',
       border: '1px solid var(--amber)',
       borderRadius: 10,
       padding: '10px 14px',
       fontSize: 12,
       color: 'var(--charcoal)',
       marginBottom: 16,
       display: 'flex',
       gap: 8,
       alignItems: 'flex-start',
     }}>
       <span>⚠️</span>
       <span>
         {isKids
           ? 'The checker is taking a nap right now. Try the example messages!'
           : 'AI backend offline — using demo mode. Results are illustrative only.'}
       </span>
     </div>
   )}
   
   When apiStatus === 'down', fall back to the mock verdict system from before 
   (keep the old MOCK_VERDICTS object as a fallback in Detector.jsx):
   
   const MOCK_VERDICTS = {
     default: {
       level: 'scam',
       confidence: 89,
       tactic: 'Demo Mode — Connect API for real analysis',
       flags: [
         { name: 'DEMO: Urgency language detected', level: 'high' },
         { name: 'DEMO: Suspicious sender pattern', level: 'high' },
         { name: 'DEMO: Requests personal information', level: 'med' },
       ],
       explanation: 'This is a demo result. Connect the Truthly API for real AI-powered analysis.',
       what_to_do: ['Do not click any links', 'Verify by calling the official number', 'Report to Action Fraud: 0300 123 2040'],
     }
   };
   
   In the catch block of analyze(), if apiStatus === 'down':
   setVerdict(MOCK_VERDICTS.default);
   setError(null); // don't show error, just show demo result
```

---

---

## FINAL FILE STRUCTURE

After all prompts are complete, your project should look like:

```
truthly/                          ← React app root (Vite)
├── src/
│   ├── components/
│   │   ├── Detector.jsx          ← Now calls /detect API
│   │   ├── ScamTwin.jsx          ← Now calls /twin API
│   │   ├── Panic.jsx             ← Rule-based, no change needed
│   │   ├── Learn.jsx             ← Rule-based, no change needed
│   │   ├── ScamDNA.jsx           ← Quiz-based, no change needed
│   │   ├── Home.jsx              ← No change needed
│   │   ├── Nav.jsx               ← No change needed
│   │   └── Onboarding.jsx        ← No change needed
│   ├── utils/
│   │   └── api.js                ← NEW: API helper functions
│   └── App.jsx                   ← Add apiStatus health check
├── .env.local                    ← NEW: local dev API URL
├── .env.production               ← NEW: production API URL
└── vite.config.js                ← NEW if missing

api/                              ← NEW: Python backend
├── main.py                       ← FastAPI with /detect + /twin + /health
├── requirements.txt
├── .env                          ← Your actual API key (git-ignored)
├── .env.example                  ← Template (committed to git)
├── .gitignore
├── Procfile                      ← Railway deployment
├── railway.json                  ← Railway config
└── README.md
```

---

## HOW TO RUN LOCALLY (after all prompts complete)

```bash
# Terminal 1 — Backend
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd ..  (back to React root)
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## AI INTERACTION MAP — What each endpoint does

```
┌─────────────────────────────────────────────────────────────────┐
│  USER ACTION              → API CALL    → CLAUDE DOES           │
├─────────────────────────────────────────────────────────────────┤
│  Paste message + Analyse  → POST /detect → Analyses for scam    │
│                                            patterns, returns     │
│                                            structured verdict    │
│                                            with flags + steps   │
├─────────────────────────────────────────────────────────────────┤
│  Click quick-reply chip   → POST /twin  → Plays scammer role,   │
│  or type custom message                   identifies which       │
│  in ScamTwin                              tactics user spotted,  │
│                                           escalates pressure or  │
│                                           ends game if caught   │
└─────────────────────────────────────────────────────────────────┘

NOT using AI (intentionally rule-based):
  Panic Mode   → Deterministic checklists. In a crisis, AI latency 
                 is dangerous. Hard-coded steps are safer.
  Scam DNA     → Quiz with fixed scoring. Consistent results matter.
  Learn page   → Static educational content. No AI needed.
```

---

## HACKATHON DEMO TIP

When presenting, show the judges this exact sequence to demonstrate the AI is real:

1. Open Detector
2. Type a custom message (NOT one of the examples) — e.g. "Your Netflix subscription failed. Update payment at netflix-billing.info"
3. Hit Analyse
4. Point out: "This is a live Claude API call. Every message is analysed in real time."
5. Show the flags are specific to THAT message, not generic

That proves to judges the AI is genuinely integrated, not mocked.

---

*Truthly Backend — FastAPI + Claude API · Built for hackathon · Deployable in 30 minutes*
