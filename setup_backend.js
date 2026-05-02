const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

const mainPy = `from fastapi import FastAPI, HTTPException
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

class DetectRequest(BaseModel):
    message: str
    profile: str = "elderly"

class Flag(BaseModel):
    name: str
    level: str

class DetectResponse(BaseModel):
    level: str
    confidence: int
    tactic: str
    flags: List[Flag]
    explanation: str
    what_to_do: List[str]

class TwinMessage(BaseModel):
    role: str
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
                "content": f"Analyse this message:\\n\\n{req.message}"
            }]
        )
        
        raw = response.content[0].text.strip()
        if raw.startswith("\`\`\`"):
            raw = raw.split("\`\`\`")[1]
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
    
    messages = []
    opener_text = " ".join(req.scenario_opener)
    messages.append({
        "role": "assistant",
        "content": json.dumps({
            "reply": opener_text,
            "game_over": False,
            "spotted_tactics": []
        })
    })
    
    for msg in req.history:
        if msg.role == "user":
            messages.append({"role": "user", "content": msg.text})
        elif msg.role == "scammer":
            messages.append({
                "role": "assistant", 
                "content": json.dumps({"reply": msg.text, "game_over": False, "spotted_tactics": []})
            })
    
    messages.append({"role": "user", "content": req.user_message})
    
    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=600,
            system=system,
            messages=messages
        )
        
        raw = response.content[0].text.strip()
        if raw.startswith("\`\`\`"):
            raw = raw.split("\`\`\`")[1]
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

@app.get("/health")
async def health():
    return {"status": "ok", "service": "Truthly API", "version": "1.0.0"}
`;

fs.writeFileSync(path.join(apiDir, 'main.py'), mainPy.replace(/\\\`\\\`\\\`/g, '\`\`\`'));

fs.writeFileSync(path.join(apiDir, 'requirements.txt'), `fastapi==0.115.0
uvicorn[standard]==0.30.0
anthropic==0.40.0
python-dotenv==1.0.0
pydantic==2.8.0
`);

fs.writeFileSync(path.join(apiDir, '.env.example'), `ANTHROPIC_API_KEY=your_api_key_here\n`);

fs.writeFileSync(path.join(apiDir, '.gitignore'), `.env
__pycache__/
*.pyc
.venv/
venv/
`);

fs.writeFileSync(path.join(apiDir, 'Procfile'), `web: uvicorn main:app --host 0.0.0.0 --port $PORT\n`);
fs.writeFileSync(path.join(apiDir, 'runtime.txt'), `python-3.11.0\n`);
fs.writeFileSync(path.join(apiDir, 'railway.json'), JSON.stringify({
  build: { builder: "NIXPACKS" },
  deploy: {
    startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT",
    healthcheckPath: "/health",
    healthcheckTimeout: 300,
    restartPolicyType: "ON_FAILURE"
  }
}, null, 2));

// Environment Config & Vite Setup (Prompt 4)
fs.writeFileSync(path.join(__dirname, '.env.local'), `VITE_API_URL=http://localhost:8000\n`);
fs.writeFileSync(path.join(__dirname, '.env.production'), `VITE_API_URL=https://your-api-url.railway.app\n`);

const utilsDir = path.join(__dirname, 'src', 'utils');
if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true });

fs.writeFileSync(path.join(utilsDir, 'api.js'), `const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function detectScam(message, profile) {
  const res = await fetch(\`\${BASE}/detect\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, profile }),
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

export async function scamTwinReply(payload) {
  const res = await fetch(\`\${BASE}/twin\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(\`\${BASE}/health\`);
  return res.json();
}
`);

let viteConfig = fs.readFileSync(path.join(__dirname, 'vite.config.js'), 'utf8');
viteConfig = viteConfig.replace('plugins: [react()],', \`plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, '')
      }
    }
  }\`);
fs.writeFileSync(path.join(__dirname, 'vite.config.js'), viteConfig);

console.log('Backend files created and Prompt 4 environment setup done.');
