# Demo Setup — Run Locally Before Presenting

**Time needed:** ~2 minutes (after first-time install)

---

## Prerequisites

- Node.js 18+ installed
- Python 3.10+ installed
- `ANTHROPIC_API_KEY` in `.env.local`

Check `.env.local` exists in the repo root and contains:
```
VITE_API_URL=http://localhost:8000
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Start the Backend (Terminal 1)

```bash
cd api
pip install -r requirements.txt   # first time only
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

---

## Start the Frontend (Terminal 2)

```bash
# from repo root
npm install    # first time only
npm run dev
```

Expected output:
```
  VITE v5.x  ready in Xms
  ➜  Local:   http://localhost:5173/
```

---

## Open in Browser

1. Go to `http://localhost:5173`
2. Select **Senior** profile on the onboarding screen
3. You should land on the Home page

---

## Open the Slides

In a second browser tab (or second window):
- Open `pitch/index.html` directly from the filesystem
- Press `F` to enter fullscreen
- Use `→` / `Space` to advance, `←` to go back

---

## Pre-Demo Checklist

- [ ] Backend terminal shows no errors
- [ ] Frontend loads at localhost:5173
- [ ] Detector tab — paste the HMRC test message (from demo-script.md) and confirm it analyses correctly
- [ ] ScamTwin tab — start one scenario to confirm AI responds
- [ ] Slides open in second tab, on Slide 1
- [ ] Display resolution set (1920×1080 recommended, or fullscreen)
- [ ] Paste buffer ready: copy the HMRC scam text from demo-script.md so you can paste it instantly

---

## If the Backend Is Down

The frontend has a built-in demo mode that activates when the API is unreachable. The Detector and ScamTwin will show pre-baked responses. SafeTools and Panic work with no backend at all.
