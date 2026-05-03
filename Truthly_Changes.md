# Truthly — Pre-Pitch Changes Guide

> **Philosophy driving every change below:**
> Truthly does not tell users something *is* a scam. It shows users *patterns that are worth checking*. Prevention is better than cure — we build perception, not verdicts.

---

## Table of Contents

1. [Remove confidence percentages — replace with severity bands](#1-remove-confidence-percentages)
2. [Reframe all verdict language — patterns not verdicts](#2-reframe-verdict-language)
3. [Watermark every ScamTwin and Detector message](#3-watermarks)
4. [Add a privacy story](#4-privacy-story)
5. [Backend pre-warm + fallback check](#5-demo-survival)
6. [Tone down alarm UI](#6-ui-tone)
7. [Pitch script additions](#7-pitch-script)

---

## 1. Remove Confidence Percentages

**File:** `api/main.py`
**Time:** ~15 minutes
**Score impact:** Ethical Alignment +3–4 pts

### Why

"89% confident this is a scam" is a verdict machine. It removes the user's own judgement from the process and presents AI output as fact. The rubric explicitly penalises tools that "make decisions for people." A number also implies precision that does not exist — Claude cannot be 89% confident about anything in a strict probabilistic sense.

### What to change

In `DETECT_SYSTEM_ELDERLY` and `DETECT_SYSTEM_KIDS`, find the section of the JSON schema that specifies `"confidence": <integer 0-100>` and replace it entirely.

**Remove this from the schema in both system prompts:**

```
"confidence": <integer 0-100>,
```

**Replace with:**

```
"severity": "high_concern" | "worth_checking" | "looks_reasonable",
```

**Update the rules section** in both prompts. Replace the confidence rule with:

```
- "severity": choose based on the weight of evidence:
  "high_concern"     = multiple strong red flags present — user should verify urgently
  "worth_checking"   = some patterns present — user should take a moment to verify
  "looks_reasonable" = no significant patterns found — but always good to double-check
  NEVER use the word "scam" in this field. NEVER say something IS safe or IS a scam.
  These are patterns to check, not verdicts.
```

**Update the Pydantic model** in `api/main.py`:

```python
# Replace:
class DetectResponse(BaseModel):
    level: str          # "scam" | "suspicious" | "safe"
    confidence: int     # 0–100
    tactic: str
    flags: List[Flag]
    explanation: str
    what_to_do: List[str]

# With:
class DetectResponse(BaseModel):
    level: str          # "high_concern" | "worth_checking" | "looks_reasonable"
    severity: str       # same value — kept for frontend compatibility
    tactic: str         # renamed internally to "pattern_name"
    flags: List[Flag]
    explanation: str
    what_to_do: List[str]
```

**Update the frontend** in `src/components/Detector.jsx`:

Replace the `verdictConfig` object:

```jsx
// Remove:
const verdictConfig = {
  scam: { icon: '🚨', label: isKids ? 'Tricky message!' : 'Scam detected' },
  suspicious: { icon: '⚠️', label: isKids ? 'Bit suspicious...' : 'Looks suspicious' },
  safe: { icon: '✅', label: isKids ? 'Looks okay!' : 'Looks safe' },
};

// Replace with:
const verdictConfig = {
  high_concern: {
    icon: '⚠️',
    label: isKids ? 'Worth checking with a grown-up' : 'Worth checking — some patterns here',
    colour: 'var(--amber)',
  },
  worth_checking: {
    icon: '🔍',
    label: isKids ? 'Something feels a bit off' : 'A few things to look into',
    colour: 'var(--amber)',
  },
  looks_reasonable: {
    icon: '✓',
    label: isKids ? 'Looks okay — always good to check' : 'Nothing obvious — still worth verifying',
    colour: 'var(--safe)',
  },
};
```

Also remove any display of a confidence number or percentage anywhere in the verdict JSX. Search the file for `confidence` and delete every render reference.

---

## 2. Reframe Verdict Language

**File:** `api/main.py` — both system prompts
**Time:** ~15 minutes
**Score impact:** Ethical Alignment +2 pts, directly answers rubric Q3

### Why

The rubric question "how does this help people rather than make decisions for them?" is answered by this change. Truthly's product philosophy is perception over cure — we show patterns, users apply judgement. The language must reflect that.

### What to change

**In `DETECT_SYSTEM_ELDERLY`, find the `explanation` rule and replace it:**

```
# Remove:
- "explanation": plain English, max 2 sentences, direct and calm

# Replace with:
- "explanation": describe the patterns you observed, not a verdict. 
  NEVER say "this is a scam" or "this is safe." 
  Instead say things like:
    "This message uses patterns often seen in refund scams — the urgency and the link are worth checking."
    "A few things here are worth a second look before you respond."
    "Nothing obvious stands out, though it's always worth calling the number on the back of your card directly."
  Write for a non-technical person. Be calm and informative, not alarming.
  Max 2 sentences. End with what the person can do to verify, not what the AI concluded.
```

**In `DETECT_SYSTEM_KIDS`, same change but child-appropriate:**

```
# Replace explanation rule with:
- "explanation": describe what you noticed in simple words, not a verdict.
  NEVER say "this is a scam" or "this is definitely safe."
  Instead say things like:
    "This message has a few things that are worth checking with a grown-up."
    "Asking for your password is something real apps never do — worth thinking about."
  Start with what the child can DO, not what the AI decided.
  Max 2 sentences. Friendly, not scary. Empowering, not alarming.
```

**Also update the `level` field rules** in both prompts:

```
# Remove references to "scam" and "safe" as level values.
# Replace with:

- "level": 
  "high_concern"     — multiple strong patterns present
  "worth_checking"   — some patterns worth looking into  
  "looks_reasonable" — nothing significant found
  
  Do NOT use these to tell the user what to conclude.
  They are internal severity signals that control UI colour only.
```

**Update the `tactic` field name in the system prompt explanation:**

```
# Replace:
- "tactic": "<primary scam tactic name, or null if safe>"

# With:
- "pattern_name": "<the primary pattern observed, described neutrally — e.g. 'urgency pressure', 'link to unverified domain', 'authority impersonation'. Use null if nothing notable found.>"
```

---

## 3. Watermarks

**Files:** `src/components/ScamTwin.jsx`, `src/components/Detector.jsx`, `src/index.css`
**Time:** ~30 minutes
**Score impact:** Ethical Alignment +2 pts, removes a hard judge question

### Why

Claude generates convincing scammer dialogue. Without watermarking, a user can screenshot a ScamTwin message and send it to a real person as if it were a real scam attempt. This is harm #3 in the ethical alignment rubric. The watermark is your defence when a judge asks "couldn't this be misused?"

### Change A — ScamTwin message watermark

In `src/components/ScamTwin.jsx`, find the scammer bubble render. It currently renders something like:

```jsx
<div key={m.id} className={`chat-bubble ${m.role}`}>{m.text}</div>
```

Replace the scammer bubble specifically with a watermarked version:

```jsx
{messages.map(m => {
  if (m.role === 'system') {
    return <div key={m.id} className="chat-bubble system">{m.text}</div>;
  }
  if (m.role === 'scammer') {
    return (
      <div key={m.id} className="scammer-bubble-wrap">
        <div
          className="chat-bubble scammer"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {m.text}
        </div>
        <div className="scammer-watermark">
          Educational simulation · Truthly · Not a real message
        </div>
      </div>
    );
  }
  return <div key={m.id} className="chat-bubble user">{m.text}</div>;
})}
```

### Change B — ScamTwin session banner

At the top of the `ChatRoom` component, inside the chat shell header area, add a persistent banner:

```jsx
<div className="simulation-banner">
  Practice scenario — AI-generated · Not a real conversation · Do not screenshot or share
</div>
```

### Change C — Debrief watermark text

At the bottom of the debrief card (when `resolved` is true), add:

```jsx
<p className="debrief-notice">
  The messages above were part of an educational simulation. 
  They do not represent real communications. Do not screenshot or share them.
</p>
```

### Change D — Detector analysis watermark

In `src/components/Detector.jsx`, inside the verdict card, add below the explanation box:

```jsx
<div className="detector-notice">
  Truthly highlights patterns for you to consider — it does not confirm whether a message is or is not a scam. 
  Always verify directly with the organisation using contact details you find yourself.
</div>
```

### CSS to add in `src/index.css`

```css
/* ── Watermarks ── */

.scammer-bubble-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  margin-bottom: 10px;
}

.scammer-watermark {
  font-size: 10px;
  color: var(--muted);
  font-style: italic;
  letter-spacing: 0.3px;
  padding-left: 4px;
  user-select: none;
  -webkit-user-select: none;
}

.simulation-banner {
  background: rgba(255, 183, 3, 0.08);
  border: 1px solid var(--amber);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  color: var(--charcoal);
  text-align: center;
  font-style: italic;
  margin-bottom: 12px;
  user-select: none;
}

.debrief-notice {
  font-size: 11px;
  color: var(--muted);
  font-style: italic;
  line-height: 1.6;
  border-top: 1px solid var(--cream-dark);
  padding-top: 10px;
  margin-top: 12px;
  text-align: center;
}

.detector-notice {
  font-size: 12px;
  color: var(--muted);
  font-style: italic;
  line-height: 1.6;
  padding: 10px 12px;
  background: var(--cream);
  border-radius: 8px;
  border-left: 3px solid var(--cream-dark);
  margin-top: 12px;
}
```

---

## 4. Privacy Story

**Files:** `src/App.jsx` (footer), `api/main.py` (logging check)
**Time:** ~20 minutes
**Score impact:** Ethical Alignment +1 pt, strong pitch moment

### Change A — Check backend does not log message bodies

In `api/main.py`, confirm there is no `print()`, `logging.info()`, or database write that records the content of `req.message` or `req.user_message`. The FastAPI default access log only records the route and status code — that is fine. If you added any debug prints during development, remove them now.

Add this comment at the top of `main.py` so it is visible in the code review:

```python
# PRIVACY: message bodies are passed to the Anthropic API and are not
# logged, stored, or persisted by this server. Only route + status is
# recorded in standard access logs. See privacy statement in frontend footer.
```

### Change B — Footer privacy line

In your main layout or `App.jsx`, add a footer (or add to an existing one):

```jsx
<footer className="app-footer">
  <span>No accounts. No tracking.</span>
  <span>Messages are sent to Claude for pattern analysis and are not stored by Truthly.</span>
  <button className="forget-btn" onClick={handleForgetMe}>
    Forget me
  </button>
</footer>
```

Add the `handleForgetMe` function in `App.jsx`:

```jsx
const handleForgetMe = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.reload();
};
```

### CSS for footer

```css
.app-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  padding: 16px 24px;
  font-size: 11px;
  color: var(--muted);
  border-top: 1px solid var(--cream-dark);
  margin-top: 48px;
}

.forget-btn {
  background: none;
  border: 1px solid var(--cream-dark);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11px;
  color: var(--muted);
  cursor: pointer;
  transition: border-color 0.2s;
}

.forget-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
```

### Pitch beat using this

During the demo, open browser DevTools → Application → Local Storage. Show it is empty (or only contains the region preference). Say: "We store nothing personal. The only thing in storage is whether you selected England or Scotland. Hit Forget Me and that's gone too."

---

## 5. Demo Survival

**No code changes — operational habits only**
**Time:** ~10 minutes setup, 5 seconds on the day

### Railway cold-start

Railway free tier spins down after 15 minutes of inactivity. The first request after spindown takes 10–30 seconds. On stage this kills the demo.

**Fix:** 30 seconds before your slot begins, open your Railway URL + `/health` in a browser tab on your phone. That warms the server. Keep the tab open.

```
https://your-app.up.railway.app/health
```

You should see `{"status":"ok","service":"Truthly API","version":"1.0.0"}` within 3 seconds. If you do not, open it again. Do not go on stage until you see that response.

### Test the offline fallback

In `src/components/Detector.jsx`, the `MOCK_VERDICTS` fallback from Prompt 6 should activate when `apiStatus === 'down'`. Test this now:

1. Stop your local FastAPI server
2. Reload the frontend
3. Paste any message and click Analyse
4. You should see the demo mode result with the banner "AI backend offline — using demo mode"

If this does not work, wire it up now. It is already written in the docs — it just needs to be confirmed as working.

### Backup video

Record a 60-second screen recording tonight showing:

- Paste a realistic scam message into Detector → show the pattern analysis result
- Open ScamTwin → pick the bank fraud scenario → send two replies → show the scammer adapt

Save it to your phone camera roll. If wifi dies on stage, play the video and narrate over it. This is not embarrassing — it is professional preparation.

---

## 6. UI Tone

**File:** `src/components/Detector.jsx`, `src/index.css`
**Time:** ~20 minutes
**Score impact:** Presentation +1 pt, removes an ethics visual concern

### Why

Academic judges scoring ethics respond to fear-based UX signals. 🚨 in bright red implies alarm and panic. Since we are already removing the "Scam detected" verdict language, the UI should match: calm, informative, empowering rather than alarming.

### Changes

In `Detector.jsx`, with the new `verdictConfig` from Change 1, ensure colours are muted amber rather than danger red for high concern results. The `high_concern` level should use `var(--amber)` not `var(--danger)`.

```jsx
// Verdict head border — change from:
borderLeft: '4px solid var(--danger)'

// To (conditionally):
borderLeft: `4px solid ${
  verdict.level === 'looks_reasonable' ? 'var(--safe)' : 'var(--amber)'
}`
```

Remove any instance of `color: var(--danger)` from the verdict display. Reserve red only for the Panic mode where urgency is appropriate.

In the flag list, change the `high` severity flag colour from danger red to a strong amber:

```css
.flag-high {
  /* Remove: color: var(--danger); background: rgba(230,57,70,0.08); */
  color: #854F0B;
  background: rgba(239,159,39,0.1);
}
```

---

## 7. Pitch Script Additions

These are sentences to say out loud — not code changes. Write them on a card.

### On the product philosophy (say this early)

> "Truthly does not tell you something is a scam. It shows you patterns that are worth checking. We believe perception beats cure — if you can recognise the shape of a scam before you act, you don't need us to tell you what to do."

### On why Panic mode has no AI (say this when you show it)

> "We deliberately did not use AI here. When someone has just transferred money to a fraudster, they need immediate, reliable steps — not a language model with a one-second latency. Hard-coded steps are safer in a crisis."

### On false positives (prepare this for Q&A)

> "If we flag a real bank message as suspicious, the user reads our explanation and then calls the number on the back of their card. That is the right action whether the message is real or fake. So a false positive still produces a safe outcome — it never produces a harmful one."

### On ScamTwin misuse (if asked)

> "We thought hard about this. The ScamTwin generates scammer dialogue that someone could theoretically screenshot. That's why every scammer message has a watermark and copy is disabled. We also thought about whether the simulation could normalise scam language — which is why the debrief always names the tactics explicitly and tells the user what the scammer was doing and why."

### Answering rubric Q3 explicitly

> "At every point, Truthly gives the user information and asks them to act on it. The Detector shows patterns and gives next steps. ScamTwin builds recognition through practice. Panic mode gives checklists the user works through themselves. We never say 'you've been scammed' or 'you're safe.' The person decides."

---

## Quick Reference — What to Do and In What Order

| Priority | Change | File | Time |
|----------|--------|------|------|
| 1 | Remove confidence %, add severity bands | `api/main.py` + `Detector.jsx` | 15 min |
| 2 | Reframe verdict language in system prompts | `api/main.py` | 15 min |
| 3 | ScamTwin watermarks + `user-select: none` | `ScamTwin.jsx` + `index.css` | 20 min |
| 4 | Detector pattern-language notice | `Detector.jsx` + `index.css` | 10 min |
| 5 | Privacy footer + Forget Me button | `App.jsx` + `index.css` | 15 min |
| 6 | Check backend does not log message bodies | `api/main.py` | 5 min |
| 7 | Calm amber colours, remove danger red from verdict | `Detector.jsx` + `index.css` | 15 min |
| 8 | Test offline fallback (kill server, check mock loads) | local dev | 10 min |
| 9 | Pre-warm Railway, record backup video | — | 25 min |
| 10 | Write pitch script sentences on a card | — | 10 min |

**Total: approximately 2 hours 20 minutes**

---

*Truthly changes guide — prepared for hackathon pitch. All changes reflect the product philosophy: show patterns, build perception, never make decisions for the user.*
