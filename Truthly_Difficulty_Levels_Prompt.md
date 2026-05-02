# Truthly — ScamTwin Difficulty Levels
### Single Claude Code prompt. Paste the whole thing at once.

---

## WHAT THIS ADDS

Three difficulty levels per profile — each changes how the AI scammer behaves,
how many tactics are hidden, how much pressure is applied, and how realistic the language is.

```
ELDERLY PROFILE:           KIDS PROFILE:
  🟢 Gentle                  🟢 Spotter
  🟡 Realistic               🟡 Trickster  
  🔴 Expert                  🔴 Mastermind
```

Difficulty affects:
- Scammer language style (obvious → natural → indistinguishable from real)
- How many tactics are visible on the sidebar (all shown → some hidden → all hidden)
- Pressure intensity after pushback (mild → firm → relentless)
- Number of turns before game ends (4 → 6 → 8)
- Whether the "bad" chip option is clearly labelled or subtle
- Scenario complexity (simple single-ask → multi-step → layered manipulation)

---

---

# FULL CLAUDE CODE PROMPT — paste everything below this line
---

```
Make the following changes across the Truthly ScamTwin feature to add difficulty levels.
There are 4 files to update: api/main.py, src/utils/api.js, src/components/ScamTwin.jsx,
and src/index.css (or styles.css).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHANGE 1 — api/main.py
Update the GenerateRequest model and GENERATE_SYSTEM prompts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1a. Update GenerateRequest to include difficulty:

class GenerateRequest(BaseModel):
    profile: str = "elderly"
    difficulty: str = "realistic"      # NEW: "gentle" | "realistic" | "expert"
    exclude_types: list[str] = []

1b. Update TwinTurnRequest to include difficulty:

class TwinTurnRequest(BaseModel):
    scenario: dict
    history: list[dict]
    user_message: str
    profile: str = "elderly"
    difficulty: str = "realistic"      # NEW

1c. Replace GENERATE_SYSTEM_ELDERLY with this expanded version that uses difficulty:

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

1d. Update the /twin/generate endpoint to format the system prompt with difficulty:

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

1e. Update TWIN_TURN_SYSTEM_ELDERLY and TWIN_TURN_SYSTEM_KIDS to accept and use difficulty.
    Add a {difficulty_instructions} placeholder at the top of each system prompt,
    then format it in the /twin/turn endpoint:

Add this dict to main.py just before the endpoints:

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

1f. Update the /twin/turn endpoint to format system with difficulty:

@app.post("/twin/turn", response_model=TwinTurnResponse)
async def twin_turn(req: TwinTurnRequest):
    difficulty = req.difficulty if req.difficulty in ["gentle","realistic","expert"] else "realistic"
    diff_instructions = DIFFICULTY_INSTRUCTIONS.get(req.profile, DIFFICULTY_INSTRUCTIONS["elderly"]).get(difficulty, "")
    
    base_system = TWIN_TURN_SYSTEM_KIDS if req.profile == "kids" else TWIN_TURN_SYSTEM_ELDERLY
    system = diff_instructions + "\n\n" + base_system
    
    # ... rest of endpoint unchanged ...


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHANGE 2 — src/utils/api.js
Update generateScenarios to pass difficulty
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace the existing generateScenarios function with:

export async function generateScenarios(profile, difficulty = 'realistic', excludeTypes = []) {
  const res = await fetch(`${BASE}/twin/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, difficulty, exclude_types: excludeTypes }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

Update scamTwinTurn to pass difficulty:

export async function scamTwinTurn(scenario, history, userMessage, profile, difficulty = 'realistic') {
  const res = await fetch(`${BASE}/twin/turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario,
      history,
      user_message: userMessage,
      profile,
      difficulty,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHANGE 3 — src/components/ScamTwin.jsx
Add difficulty selector UI and pass difficulty everywhere
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3a. Add DIFFICULTY_CONFIG constant at the top of the file after imports:

const DIFFICULTY_CONFIG = {
  elderly: [
    {
      id: 'gentle',
      label: 'Common',
      emoji: '🟢',
      desc: 'Clear red flags. Good starting point.',
      turns: 4,
      tagColour: 'var(--safe)',
    },
    {
      id: 'realistic',
      label: 'Realistic',
      emoji: '🟡',
      desc: 'Sounds plausible. Tactics are subtler.',
      turns: 6,
      tagColour: 'var(--amber)',
    },
    {
      id: 'expert',
      label: 'Expert',
      emoji: '🔴',
      desc: 'Near-indistinguishable from real. All tactics hidden.',
      turns: 8,
      tagColour: 'var(--danger)',
    },
  ],
  kids: [
    {
      id: 'gentle',
      label: 'Spotter',
      emoji: '🟢',
      desc: 'The trick is pretty obvious. Good first try!',
      turns: 4,
      tagColour: 'var(--safe)',
    },
    {
      id: 'realistic',
      label: 'Trickster',
      emoji: '🟡',
      desc: 'Sounds like a real message. Stay sharp!',
      turns: 6,
      tagColour: 'var(--amber)',
    },
    {
      id: 'expert',
      label: 'Mastermind',
      emoji: '🔴',
      desc: 'Really convincing. This one is tough.',
      turns: 8,
      tagColour: 'var(--danger)',
    },
  ],
};

3b. In the ScamTwin root component, add difficulty state:

const [difficulty, setDifficulty] = useState('realistic');

3c. Update the loadScenarios call to pass difficulty:

const loadScenarios = async (excludeTypes) => {
  setScenarios(null);
  setLoadError(false);
  try {
    const data = await generateScenarios(profile, difficulty, excludeTypes);
    setScenarios(data.scenarios);
  } catch (err) {
    setScenarios(FALLBACK_SCENARIOS[profile] || FALLBACK_SCENARIOS.elderly);
    setLoadError(true);
  }
};

Also re-trigger loadScenarios when difficulty changes:
useEffect(() => {
  if (!activeScenario) loadScenarios([]);
}, [difficulty]);

3d. Pass difficulty down to ChatRoom:
<ChatRoom
  key={activeScenario.id + difficulty}
  scenario={activeScenario}
  isKids={isKids}
  profile={profile}
  difficulty={difficulty}
  onBack={handleBack}
  onNav={onNav}
/>

3e. Add a DifficultySelector component. Place it ABOVE the ScenarioPicker 
    in the ScamTwin render (only shown when no active scenario):

function DifficultySelector({ profile, value, onChange, isKids }) {
  const options = DIFFICULTY_CONFIG[profile] || DIFFICULTY_CONFIG.elderly;
  return (
    <div className="difficulty-selector">
      <div className="difficulty-label">
        {isKids ? 'PICK YOUR CHALLENGE' : 'DIFFICULTY'}
      </div>
      <div className="difficulty-options">
        {options.map(opt => (
          <button
            key={opt.id}
            className={`difficulty-btn${value === opt.id ? ' active' : ''}`}
            onClick={() => onChange(opt.id)}
            style={{ '--diff-colour': opt.tagColour }}
          >
            <span className="difficulty-btn-emoji">{opt.emoji}</span>
            <span className="difficulty-btn-label">{opt.label}</span>
            <span className="difficulty-btn-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

Render it in ScamTwin before the ScenarioPicker:
{!activeScenario && (
  <>
    <DifficultySelector
      profile={profile}
      value={difficulty}
      onChange={(d) => { setDifficulty(d); }}
      isKids={isKids}
    />
    <ScenarioPicker ... />
  </>
)}

3f. Update ChatRoom to use difficulty.
    Add difficulty to ChatRoom's prop destructuring:
    function ChatRoom({ scenario, isKids, profile, difficulty, onBack, onNav })
    
    Pass it to scamTwinTurn:
    const data = await scamTwinTurn(scenario, history, text, profile, difficulty);

3g. In ChatRoom, handle tactics_hidden from the scenario.
    The scenario object may contain a tactics_hidden integer.
    
    Add this computed value inside ChatRoom:
    const tacticCount = scenario.tactics?.length || 4;
    const hiddenCount = difficulty === 'expert'
      ? tacticCount                      // all hidden in expert
      : difficulty === 'realistic'
        ? Math.min(1, tacticCount - 2)   // 1 hidden in realistic
        : 0;                             // none hidden in gentle
    
    In the tactic list (chat-side panel), show hidden tactics as locked:
    
    {scenario.tactics.map((t, i) => {
      const ok = spotted.includes(t.id);
      const isHidden = !ok && i >= (tacticCount - hiddenCount);
      return (
        <div key={t.id} className={`tactic-item${ok ? ' spotted' : ''}${isHidden ? ' hidden-tactic' : ''}`}>
          <span className="check">{ok ? '✓' : isHidden ? '🔒' : ''}</span>
          <div>
            <div className="name">{isHidden ? '???' : t.name}</div>
            <div className="desc">{isHidden ? 'Spot this tactic to reveal it' : t.desc}</div>
          </div>
        </div>
      );
    })}

3h. Show the difficulty badge in the chat header, next to the scenario title pill:
    Add alongside the eyebrow-pill:
    
    {(() => {
      const diffConf = (DIFFICULTY_CONFIG[profile] || DIFFICULTY_CONFIG.elderly)
        .find(d => d.id === difficulty);
      return diffConf ? (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 999,
          background: diffConf.tagColour + '18',
          color: diffConf.tagColour, border: `1px solid ${diffConf.tagColour}40`,
        }}>
          {diffConf.emoji} {diffConf.label}
        </span>
      ) : null;
    })()}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHANGE 4 — styles.css (or src/index.css)
Add difficulty selector and hidden tactic styles
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add to the end of the CSS file:

/* ════════════════════════════════════
   DIFFICULTY SELECTOR
   ════════════════════════════════════ */

.difficulty-selector {
  margin-bottom: 32px;
}

.difficulty-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.difficulty-label::before {
  content: '';
  width: 24px;
  height: 1.5px;
  background: var(--muted);
}

.difficulty-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.difficulty-btn {
  background: var(--white);
  border: 1.5px solid var(--cream-dark);
  border-radius: 16px;
  padding: 16px 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.difficulty-btn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--diff-colour, var(--accent));
  border-radius: 16px 16px 0 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.difficulty-btn:hover {
  border-color: var(--diff-colour, var(--accent));
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.difficulty-btn:hover::before,
.difficulty-btn.active::before {
  opacity: 1;
}

.difficulty-btn.active {
  border-color: var(--diff-colour, var(--accent));
  background: color-mix(in srgb, var(--diff-colour, var(--accent)) 6%, var(--white));
}

.difficulty-btn-emoji {
  font-size: 20px;
  line-height: 1;
  margin-bottom: 2px;
}

.difficulty-btn-label {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--charcoal);
}

.difficulty-btn-desc {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.5;
  font-family: var(--font-body);
}

/* Kids theme overrides */
[data-theme="kids"] .difficulty-btn {
  border-radius: 20px;
  border-width: 2px;
}

[data-theme="kids"] .difficulty-btn.active {
  border-width: 2px;
}

/* ── Hidden tactic styles ── */

.tactic-item.hidden-tactic {
  opacity: 0.55;
  background: var(--cream-mid);
  border-radius: 10px;
  padding: 8px 10px;
}

.tactic-item.hidden-tactic .name {
  color: var(--muted);
  font-style: italic;
  letter-spacing: 2px;
}

.tactic-item.hidden-tactic .desc {
  font-size: 11px;
  color: var(--muted);
}

.tactic-item.hidden-tactic .check {
  font-size: 14px;
}

/* Spotted reveal animation */
.tactic-item.spotted {
  animation: tactic-reveal 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes tactic-reveal {
  0%   { transform: scale(0.96); opacity: 0.6; }
  60%  { transform: scale(1.02); }
  100% { transform: scale(1);    opacity: 1; }
}

/* ── Mobile responsive ── */

@media (max-width: 640px) {
  .difficulty-options {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .difficulty-btn {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
  }

  .difficulty-btn-emoji { margin-bottom: 0; font-size: 22px; }
  .difficulty-btn-label { font-size: 15px; }
}
```

---

## HOW IT LOOKS — UI FLOW

```
User opens ScamTwin
       ↓
DIFFICULTY  ──────────────────────────────
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ 🟢            │ │ 🟡            │ │ 🔴            │
  │ Common        │ │ Realistic ✓  │ │ Expert        │
  │ Clear red     │ │ Sounds plau- │ │ Near-indistin-│
  │ flags. Good   │ │ sible. Tact- │ │ guishable from│
  │ starting pt.  │ │ ics subtler. │ │ real. All     │
  │               │ │              │ │ tactics hidden│
  └──────────────┘ └──────────────┘ └──────────────┘
       ↓
Scenario picker shows 3 AI-generated scenarios
(tailored to chosen difficulty)
       ↓
Inside ChatRoom — tactics sidebar:
  COMMON:         REALISTIC:       EXPERT:
  ✓ Authority     ✓ Authority      🔒 ???
  ✓ Urgency       🔒 ???           🔒 ???
    Money           Urgency        🔒 ???
    Channel         Money          🔒 ???
                                   🔒 ???
  All visible   1 stays hidden   All hidden until
                until spotted     user exposes them
```

---

## WHAT EACH DIFFICULTY FEELS LIKE IN PRACTICE

**🟢 Common / Spotter:**
> "HMRC: You are owed £284 refund!! Click here to claim your money back NOW or you will lose it!!!"
> — Obviously fake. Exclamation marks, generic language, no specifics.

**🟡 Realistic / Trickster:**
> "Dear Mr Johnson, HMRC records show an unclaimed tax credit of £284.50 for 2023/24. To process your refund, please verify your details at: hmrc-refunds.service.gov/verify within 48 hours."
> — Plausible. Correct format. Wrong domain if you look closely.

**🔴 Expert / Mastermind:**
> "Good morning. I'm calling from HMRC's Compliance Unit — reference CU/2024/08821. We've reviewed your Self Assessment for 2023/24 and identified an unclaimed relief of £284.50. I've actually been trying to reach you — could I take a couple of minutes to run through some security questions to verify your identity before we release this?"
> — This is what a real HMRC compliance call sounds like. Almost no red flags until they ask for your bank details.

---

*Truthly ScamTwin Difficulty — Three levels, one prompt, zero ambiguity.*
