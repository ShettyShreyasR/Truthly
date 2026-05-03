# Truthly Pitch Deck & Live Demo — Design Spec
**Date:** 2026-05-03  
**Format:** HTML/CSS slides (self-contained, no install needed) + local live demo  
**Slot:** 8 minutes total (slides + demo combined)  
**Audience:** Hackathon judges (technical panel)  
**Approach:** Story-led — emotional hook first, product second

---

## Overview

A single `pitch/index.html` file containing all 5 slides, navigable with arrow keys or spacebar. A separate `pitch/demo-script.md` contains the narrated demo walkthrough. The demo runs against the local dev stack (Vite frontend + FastAPI backend).

---

## Slide Structure

### Slide 1 — The Hook (45 sec)
**Goal:** Make judges feel the problem before they see the product.

**Content:**
> "Your gran gets a text. It says it's from HMRC. It has her name. It has the last 4 digits of her tax reference. She's seen scam texts before — but this one looks different."

- No product mention
- No Truthly logo until the end of the slide
- Single quote block, large type, dark accent on the word "different"

---

### Slide 2 — The Gap (30 sec)
**Goal:** Establish why existing solutions fail the target audience.

**Content:**
- Stat: *"£2.3bn lost to fraud in the UK in 2023"* (source: Action Fraud)
- Two columns: Elderly adults / Children & teens
- Each column: "What exists" (complex tools, IT jargon) vs "What they need" (plain language, guided action)
- Closing line: *"No one is building for the people who actually get scammed."*

---

### Slide 3 — What is Truthly (30 sec)
**Goal:** One-sentence positioning + core philosophy.

**Content:**
- Headline: *"AI-powered scam awareness for the people who need it most."*
- Two profile chips shown side by side: 🫖 Senior / 🦊 Kids
- Philosophy callout box: *"Show patterns. Build perception. Never make decisions for the user."*
- Powered by Claude (Anthropic)

---

### Slide 4 — How It Works (30 sec)
**Goal:** Visual map of the 5 modes — sets up the demo.

**Content:**
Five labelled cards in a row:
1. 🔍 Detector — analyse suspicious messages
2. 🎭 ScamTwin — practice spotting scam tactics
3. 🧬 ScamDNA — find your vulnerability type
4. 🆘 Panic — crisis checklist (no AI)
5. 🔗 SafeTools — verified external resources

Closing line: *"Let me show you."* → transitions to demo

---

### Live Demo (4 min)
**Goal:** Show the product working. Narrated, not silent.

**Setup required before presenting:**
- `npm run dev` running in the Truthly root (Vite on port 5173)
- `python api/main.py` or `uvicorn main:app` running in `/api` (FastAPI on port 8000)
- `.env.local` has valid `VITE_API_URL=http://localhost:8000` and `ANTHROPIC_API_KEY`
- Browser open to `http://localhost:5173`, profile already set to "elderly"
- A pre-typed scam message ready to paste (see Demo Script below)

**Demo flow:**

| Step | Action | Say | Time |
|------|--------|-----|------|
| ① | Show elderly profile, click profile chip to switch to kids | "Two profiles — completely different experience, same protection" | 20 sec |
| ② | Switch back to elderly, go to Detector, paste HMRC scam text | "Let's paste a message I received last week…" walk through the severity band and flags | 60 sec |
| ③ | Go to ScamTwin, pick a scenario, send 2 replies | "Now — what if you could practice spotting scams before a real one arrives?" Show AI scammer adapting | 75 sec |
| ④ | Click SafeTools tab | "We didn't want Truthly to be the only tool someone reaches for. So we built a curated list of verified resources." | 20 sec |
| ⑤ | Click Panic tab | "And if the worst happens — Panic mode. Hardcoded. No AI. Because when seconds matter, you need reliability." | 20 sec |

**Pre-typed scam message for Detector:**
```
Dear [Name], HMRC has identified an unpaid tax liability of £847.30 on your account.
Failure to resolve this within 24 hours will result in legal proceedings.
Please call 0800 085 3300 immediately or visit: hmrc-refund-portal.co.uk/verify
Reference: UK/TAX/2026/4471
```

---

### Slide 5 — Close + Ask (1 min)
**Goal:** Land the impact and leave judges with a clear "so what."

**Content:**
- Three bullet points: what was built / who it helps / what's next
  - *Built with React, Vite, Python FastAPI, Claude Sonnet*
  - *Designed for UK elderly adults and children most at risk from scams*
  - *Next: Railway deployment, open-source release, UK charity partnerships*
- Closing line (spoken, not on slide):
  > *"We built Truthly because the people most at risk from scams are the least served by the tools that exist."*
- QR code → `https://truthly-chi.vercel.app` (live Vercel deploy)

---

## HTML Slide Architecture

**File:** `pitch/index.html` — single self-contained file, no dependencies  
**Navigation:** Arrow keys, spacebar, or on-screen dots  
**Style:** Truthly design language — cream background (`#fffdf9`), charcoal text (`#1c1917`), orange accent (`#ff6b35`), mono font for labels  
**Slide ratio:** 16:9, fullscreen via `F11`  
**Transitions:** Simple fade (CSS only, no JS libraries)

Each slide is a `<section>` with `data-slide` attribute. A tiny vanilla JS controller handles keyboard nav and dot indicators.

---

## Demo Setup Script

A `pitch/demo-setup.md` file with step-by-step local setup commands so the demo can be started in under 2 minutes before presenting:

```bash
# Terminal 1 — frontend
cd /path/to/Truthly
npm run dev

# Terminal 2 — backend
cd /path/to/Truthly/api
pip install -r requirements.txt   # first time only
uvicorn main:app --reload --port 8000
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `pitch/index.html` | All 5 slides, self-contained |
| `pitch/demo-script.md` | Narrated demo walkthrough with exact lines to say |
| `pitch/demo-setup.md` | Local setup commands |
