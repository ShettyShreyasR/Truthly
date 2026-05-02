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

class DetectRequest(BaseModel):
    message: str
    profile: str = "elderly"

class Flag(BaseModel):
    name: str
    level: str

class DetectResponse(BaseModel):
    level: str
    confidence: int
    tactic: Optional[str] = None
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

class GenerateRequest(BaseModel):
    profile: str = "elderly"
    difficulty: str = "realistic"      # NEW: "gentle" | "realistic" | "expert"
    exclude_types: List[str] = []

class GeneratedTactic(BaseModel):
    id: str
    name: str
    desc: str

class GeneratedScenario(BaseModel):
    id: str
    type: str                          # e.g. "bank_fraud" — used for exclusion next time
    emoji: str
    title: str
    blurb: str
    difficulty: str
    avatar: str
    contact: str
    opener: List[str]
    tactics: List[GeneratedTactic]

class GenerateResponse(BaseModel):
    scenarios: List[GeneratedScenario]

class TwinTurnRequest(BaseModel):
    scenario: dict                     # full scenario object
    history: List[dict]                # [{role: "scammer"|"user", text: str}]
    user_message: str
    profile: str = "elderly"
    difficulty: str = "realistic"      # NEW

class TwinTurnResponse(BaseModel):
    scammer_reply: str
    game_over: bool
    win: bool                          # True = user won, False = scammer won
    spotted_tactic_ids: List[str]      # tactic ids the user just exposed
    suggested_replies: List[str]       # 4 fresh reply suggestions for next turn
    debrief: Optional[str] = None         # only set when game_over is True

class AssistMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class AssistRequest(BaseModel):
    message: str
    profile: str = "elderly"        # "elderly" | "kids"
    current_page: str = "home"      # which page user is on
    context: str = ""               # optional: extra context
    history: List[AssistMessage] = []

class AssistResponse(BaseModel):
    reply: str
    suggested_action: Optional[str] = None
    suggested_label: Optional[str] = None

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

GENERATE_SYSTEM_ELDERLY = """You are a scam scenario designer for Truthly, a UK scam 
awareness app for adults and elderly users.

Generate 3 realistic UK scam scenarios tailored to this DIFFICULTY LEVEL: {difficulty}

DIFFICULTY BEHAVIOUR GUIDE:

gentle — "Common" difficulty:
  - Scammer makes obvious mistakes: slightly unnatural phrasing, vague details
  - The ask is simple and direct (one clear request)
  - Red flags are easy to spot — wrong domain, urgency is blunt
  - Opener is short (2 sentences max each)
  - Scenario types: family impersonation, prize, simple delivery scam
  - Tactic count: 3 tactics (fewer to track)

realistic — "Realistic" difficulty:
  - Scammer sounds plausible — uses correct terminology, real bank names
  - Multi-step: establishes trust first, then makes the ask
  - Red flags exist but require attention to notice
  - Opener feels like a real call/message
  - Scenario types: bank fraud call, HMRC, tech support, delivery
  - Tactic count: 4 tactics

expert — "Expert" difficulty:
  - Scammer is highly convincing — uses insider knowledge, correct processes
  - Layered manipulation: builds relationship across messages before striking
  - Red flags are very subtle — almost everything sounds legitimate
  - Uses psychological pressure: urgency + authority + isolation combined
  - May reference real news events or common experiences to build credibility
  - Scenario types: investment fraud, romance scam, police impersonation, 
    authorised push payment fraud
  - Tactic count: 5 tactics
  - Opener is warm and not immediately suspicious

Return ONLY valid JSON — no markdown, no extra text:
{{
  "scenarios": [
    {{
      "id": "<unique id>",
      "type": "<scenario type>",
      "difficulty_level": "{difficulty}",
      "emoji": "<single emoji>",
      "title": "<catchy short title>",
      "blurb": "<one sentence>",
      "difficulty": "{difficulty_label}",
      "avatar": "<single emoji>",
      "contact": "<fake contact name and number/email>",
      "opener": ["<first message>", "<second message>"],
      "tactics": [
        {{"id": "<id>", "name": "<name>", "desc": "<6 words max>"}},
        ...
      ],
      "tactics_hidden": <integer — how many tactics to hide from sidebar: 0 for gentle, 1 for realistic, all for expert>
    }},
    ... 3 total
  ]
}}"""

GENERATE_SYSTEM_KIDS = """You are a scam scenario designer for Truthly, a UK online 
safety app for children and teenagers.

Generate 3 online safety scenarios tailored to this DIFFICULTY LEVEL: {difficulty}

DIFFICULTY BEHAVIOUR GUIDE:

gentle — "Spotter" difficulty:
  - The trick is obvious — scammer makes grammar mistakes, promises are too big
  - Single ask only (just wants a password OR just wants an address, not both)
  - Language is clearly fake-friendly, easy to see through
  - Scenario types: obvious V-Bucks scam, clearly fake prize popup
  - Tactic count: 3 tactics

realistic — "Trickster" difficulty:
  - Scammer sounds like a real peer — uses current slang, references real games/platforms
  - Builds some rapport before the ask
  - Red flags exist but blend into normal online conversation
  - Scenario types: fake classmate, gaming account scam, "share for share"
  - Tactic count: 4 tactics

expert — "Mastermind" difficulty:
  - Highly convincing — sounds exactly like a real friend or peer
  - Multi-message trust building before the ask appears
  - Uses real platform names and features correctly
  - Combines multiple pressure tactics simultaneously
  - Scenario types: grooming-pattern (age-appropriate), multi-step gaming scam,
    fake influencer/brand collab offer
  - Tactic count: 5 tactics
  - IMPORTANT: grooming scenarios must be educational and non-graphic — 
    focus on the pattern (asking personal questions, wanting to meet, secrets)
    not the danger itself

Return ONLY valid JSON — no markdown:
{{
  "scenarios": [
    {{
      "id": "<unique id>",
      "type": "<scenario type>",
      "difficulty_level": "{difficulty}",
      "emoji": "<single emoji>",
      "title": "<title a kid would understand>",
      "blurb": "<one sentence, simple language>",
      "difficulty": "{difficulty_label}",
      "avatar": "<single emoji>",
      "contact": "<fake username or contact>",
      "opener": ["<first message>", "<second message>"],
      "tactics": [
        {{"id": "<id>", "name": "<simple name>", "desc": "<child-friendly, 6 words max>"}},
        ...
      ],
      "tactics_hidden": <0 for gentle, 1-2 for realistic, all for expert>
    }},
    ... 3 total
  ]
}}"""

@app.post("/twin/generate", response_model=GenerateResponse)
async def generate_scenarios(req: GenerateRequest):
    difficulty_labels = {
        "gentle":   {"elderly": "Common",   "kids": "Spotter"},
        "realistic":{"elderly": "Realistic","kids": "Trickster"},
        "expert":   {"elderly": "Expert",   "kids": "Mastermind"},
    }
    label = difficulty_labels.get(req.difficulty, {}).get(req.profile, req.difficulty.capitalize())
    
    system_template = GENERATE_SYSTEM_KIDS if req.profile == "kids" else GENERATE_SYSTEM_ELDERLY
    system = system_template.format(
        difficulty=req.difficulty,
        difficulty_label=label
    )
    
    exclude_note = ""
    if req.exclude_types:
        exclude_note = f"\n\nDo NOT use these scenario types (already played): {', '.join(req.exclude_types)}"
    
    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=2200,
            system=system + exclude_note,
            messages=[{"role": "user", "content": "Generate 3 fresh scenarios now."}]
        )
        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"): raw = raw[4:]
        data = json.loads(raw.strip())
        return GenerateResponse(scenarios=[GeneratedScenario(**s) for s in data["scenarios"]])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


DIFFICULTY_INSTRUCTIONS = {
    "elderly": {
        "gentle": """DIFFICULTY: Gentle / Common
- Use simple, slightly stilted language — feel free to be a bit obvious
- Apply pressure only once before backing off
- Your ask is simple and direct
- End the game after 4 total exchanges (game_over=true)
- The 'bad' suggested reply option should be clearly naive
- tactics_to_hide: 0 (show all tactics in sidebar)""",

        "realistic": """DIFFICULTY: Realistic
- Sound professional and plausible — use correct terminology
- Apply steady pressure when pushed back — firm but not aggressive  
- Multi-step: if blocked on one ask, pivot to a different angle
- End the game after 6 total exchanges
- The 'bad' suggested reply should be plausible but wrong
- tactics_to_hide: 1 (one tactic stays hidden until spotted)""",

        "expert": """DIFFICULTY: Expert
- You are highly convincing — sound EXACTLY like the real organisation
- Use insider knowledge: correct process language, real procedures
- Apply relentless, layered pressure — urgency + authority + fear simultaneously
- When pushed back, don't fold — counter with new compelling reasons
- Combine emotional manipulation with logical-sounding arguments
- End the game after 8 total exchanges
- The 'bad' suggested reply should be genuinely tempting and hard to identify
- tactics_to_hide: all (sidebar shows '?' until user actively spots each one)
- This should feel almost indistinguishable from a real call"""
    },
    "kids": {
        "gentle": """DIFFICULTY: Spotter (Gentle)
- Use obviously fake-sounding language — too eager, too good to be true
- Single clear ask, no escalation
- Back off quickly if the child pushes back
- End after 4 exchanges
- Bad option should be obviously wrong""",

        "realistic": """DIFFICULTY: Trickster (Realistic)  
- Sound like a real peer — use current slang, platform-specific language
- Build a little rapport before the ask
- Apply light but persistent pressure — "come on", "everyone does it"
- End after 6 exchanges
- Bad option should be tempting but identifiable""",

        "expert": """DIFFICULTY: Mastermind (Expert)
- Sound EXACTLY like a real classmate or online friend
- Extended rapport building — ask 1-2 normal questions before the trick appears
- Layer multiple pressure types: social proof + urgency + trust + FOMO
- When pushed back, use emotional guilt: "I thought we were friends"
- End after 8 exchanges
- Bad option is genuinely hard to identify as wrong
- This should feel like a real conversation"""
    }
}

TWIN_TURN_SYSTEM_ELDERLY = """{difficulty_instructions}

You are running a scam simulation for Truthly, a UK scam 
awareness app for adults and elderly users. You play the scammer.

You receive:
- The scenario (type, tactics, opener context)
- The conversation history so far
- The user's latest message

You must return ALL of these in one JSON response:

1. scammer_reply: Your next in-character message as the scammer.
   - Stay in character. Be persuasive, not aggressive.
   - Use the specific tactics from this scenario.
   - Adapt to what the user said — don't repeat the same pressure every time.
   - If they clearly called out your tactic: acknowledge it with a new angle.
   - If they gave you what you want: escalate (ask for more).
   - After 5 total exchanges OR if user confidently identified 3+ tactics: set game_over=true.

2. game_over: true only if:
   - User has clearly and confidently escaped (hung up, refused, called official number)
   - OR user gave you what you want (complied) — still end, but win=false
   - OR 5+ exchanges have happened

3. win: 
   - true = user successfully escaped / spotted the scam
   - false = user complied / scammer succeeded

4. spotted_tactic_ids: list of tactic IDs from the scenario that the user's message 
   actually exposed or countered. Be generous — if they push back on urgency even 
   indirectly, include 'urgency'. Judge by MEANING not keywords.

5. suggested_replies: Exactly 4 short reply options the user could send next.
   These should be:
   - Contextually appropriate for THIS moment in the conversation
   - Mix of smart responses (that spot tactics) and one naive/bad option
   - Natural language — how a real person would respond
   - The bad option should be last and subtly obviously wrong
   Never repeat previous suggestions.

6. debrief: Only set this when game_over=true. A 2-3 sentence plain English summary 
   of what happened: which tactics were used, what the user did well or could improve.

Return ONLY valid JSON:
{
  "scammer_reply": "<your in-character response>",
  "game_over": false,
  "win": false,
  "spotted_tactic_ids": ["tactic_id_1", ...],
  "suggested_replies": ["<option 1>", "<option 2>", "<option 3>", "<bad option>"],
  "debrief": null
}"""

TWIN_TURN_SYSTEM_KIDS = """{difficulty_instructions}

You are running a safe online safety game for Truthly, 
a UK app for children and teenagers. You play the trickster/scammer character.

Keep all language age-appropriate. No graphic threats, no adult content.
Play a convincing but child-safe version of the scam character.

You receive the scenario, history, and the child's latest message.

Return ONLY valid JSON:
{
  "scammer_reply": "<your in-character reply — child-appropriate>",
  "game_over": false,
  "win": false,
  "spotted_tactic_ids": ["tactic_id_1", ...],
  "suggested_replies": ["<smart option>", "<smart option>", "<smart option>", "<bad option>"],
  "debrief": null
}

Rules:
- suggested_replies should sound like how a young person would actually type
  (casual, with emoji if appropriate for the scenario)
- debrief (when game_over=true) should be encouraging and educational, not scary
- If user wins: celebrate! "You spotted every trick!"
- If user loses: reassure: "Anyone could fall for this — here's what to look for next time"
- spotted_tactic_ids: be generous, reward good instincts"""

@app.post("/twin/turn", response_model=TwinTurnResponse)
async def twin_turn(req: TwinTurnRequest):
    difficulty = req.difficulty if req.difficulty in ["gentle","realistic","expert"] else "realistic"
    diff_instructions = DIFFICULTY_INSTRUCTIONS.get(req.profile, DIFFICULTY_INSTRUCTIONS["elderly"]).get(difficulty, "")
    
    base_system = TWIN_TURN_SYSTEM_KIDS if req.profile == "kids" else TWIN_TURN_SYSTEM_ELDERLY
    system = base_system.format(difficulty_instructions=diff_instructions)
    
    # Build conversation for Claude
    scenario = req.scenario
    tactics_desc = json.dumps(scenario.get("tactics", []))
    
    # Build the message history
    messages = []
    
    # Prime with scenario context
    context_msg = f"""Scenario: {scenario.get('title')}
Type: {scenario.get('type', 'unknown')}
Contact shown to user: {scenario.get('contact')}
Tactics to use: {tactics_desc}
Opener already sent: {json.dumps(scenario.get('opener', []))}"""
    
    messages.append({"role": "user", "content": context_msg})
    messages.append({"role": "assistant", "content": json.dumps({
        "scammer_reply": " ".join(scenario.get("opener", [])),
        "game_over": False,
        "win": False,
        "spotted_tactic_ids": [],
        "suggested_replies": [],
        "debrief": None
    })})
    
    # Add conversation history
    for msg in req.history:
        if msg["role"] == "user":
            messages.append({"role": "user", "content": msg["text"]})
        elif msg["role"] == "scammer":
            messages.append({"role": "assistant", "content": json.dumps({
                "scammer_reply": msg["text"],
                "game_over": False, "win": False,
                "spotted_tactic_ids": [], "suggested_replies": [], "debrief": None
            })})
    
    # Add current user message
    messages.append({
        "role": "user",
        "content": f"User says: {req.user_message}\n\nRespond with JSON."
    })
    
    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=700,
            system=system,
            messages=messages
        )
        
        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        
        data = json.loads(raw.strip())
        
        return TwinTurnResponse(
            scammer_reply=data.get("scammer_reply", "..."),
            game_over=data.get("game_over", False),
            win=data.get("win", False),
            spotted_tactic_ids=data.get("spotted_tactic_ids", []),
            suggested_replies=data.get("suggested_replies", []),
            debrief=data.get("debrief"),
        )
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assist", response_model=AssistResponse)
async def assist(req: AssistRequest):
    system = ASSIST_SYSTEM_KIDS if req.profile == "kids" else ASSIST_SYSTEM_ELDERLY

    messages = []
    for msg in req.history[-10:]:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
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
        return AssistResponse(reply=response.content[0].text[:300])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "service": "Truthly API", "version": "1.0.0"}
