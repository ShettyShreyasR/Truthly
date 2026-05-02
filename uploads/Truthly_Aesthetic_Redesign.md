# 🎨 Truthly — Refined Aesthetic Redesign Spec
### Same cream & orange palette. Elevated execution.

---

## What Changed & Why

The original design was **functional but generic** — standard cards, standard layouts,
standard everything. This redesign keeps every colour but elevates the execution into
something that feels like a **premium editorial product**, not a hackathon project.

The three pillars of the new aesthetic:

```
1. EDITORIAL TYPOGRAPHY   — Playfair Display replaces Syne. Serif + italic = soul.
2. BENTO GRID LAYOUTS     — Asymmetric card grids instead of uniform rows.
3. TEXTURE & DEPTH        — Grain overlays, radial gradients, glassmorphism on dark sections.
```

---

## 🎨 Colour System (unchanged, refined usage)

```css
:root {
  /* Core */
  --cream:        #FFF8F0;   /* Page background — always */
  --cream-mid:    #F5EDE0;   /* Secondary sections, hover states */
  --cream-dark:   #EDD9C0;   /* Borders, dividers */
  --orange:       #FF6B35;   /* Primary accent — CTAs, highlights */
  --orange-light: #FF8C61;   /* Hover state of orange */
  --peach:        #FFCBA4;   /* Soft backgrounds, tags */
  --charcoal:     #1C1917;   /* Primary text, dark sections */
  --charcoal-mid: #2C2820;   /* Dark cards */
  --muted:        #8C7B6B;   /* Secondary text, labels */

  /* Semantic */
  --safe:         #4CAF82;
  --danger:       #E63946;
  --amber:        #FFB703;
  --white:        #FFFFFF;
}
```

**New usage rules:**
- **Charcoal** replaces orange as primary button colour (orange on hover) — more premium
- **Orange** is now a true accent — used sparingly for maximum impact
- **Peach** gradients replace flat cream backgrounds in hero sections
- Dark sections use `--charcoal` not black — warmer, cohesive with the palette

---

## ✍️ Typography System (UPGRADED)

```css
/* 
  OLD: Syne (all headings) + DM Sans (body) → felt techy/startup
  NEW: Playfair Display (display) + DM Sans (body) → feels editorial/trustworthy
*/

/* Display — all H1, H2, hero text */
font-family: 'Playfair Display', serif;
font-weight: 900;
font-style: italic;           /* ← Use italic for emotional words */
letter-spacing: -1.5px;       /* Tight tracking = premium */

/* Body — all paragraphs, UI text */
font-family: 'DM Sans', sans-serif;
font-weight: 400;             /* Light for body, 600 for emphasis */
line-height: 1.7;

/* Mono — labels, tags, badges, data */
font-family: 'Space Mono', monospace;
font-size: 10-11px;
letter-spacing: 1.5px;
text-transform: uppercase;

/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
```

### Headline Patterns

```
H1 Hero:    "Don't get fooled." (roman) + newline + "Get Truthly." (italic orange)
H2 Section: "Built for everyone," (roman) + italic coloured word
Labels:     ALL CAPS · SPACED · MONO · orange
```

---

## 🧩 Component Redesigns

### 1. Navbar — Frosted Glass

```css
nav {
  background: rgba(255, 248, 240, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 107, 53, 0.12);
  height: 64px;
}

/* Logo */
.logo {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: 22px;
  letter-spacing: -0.5px;
  color: var(--charcoal);
}
.logo span { color: var(--orange); font-style: italic; }
/* Renders as: Truth[ly] where ly is orange italic */

/* Nav links */
.nav-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  transition: color 0.2s;
}
.nav-link:hover { color: var(--charcoal); }

/* PANIC BUTTON — always visible, red, pulsing */
.panic-btn {
  background: var(--danger);
  color: white;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 8px 18px;
  border-radius: 999px;
  animation: pulse-red 2.5s ease-in-out infinite;
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(230, 57, 70, 0); }
}
```

---

### 2. Hero Section — Editorial Split Layout

```
LEFT COLUMN (55%):
  ┌─ Eyebrow badge ──────────────────────────┐
  │  ● AI-POWERED PROTECTION                 │
  └──────────────────────────────────────────┘
  
  H1:
  "Don't get           ← roman, charcoal
   fooled.             ← roman, charcoal
   Get Truthly."       ← italic, orange

  Subtext (17px, muted, max 420px)
  Two CTAs side by side
  Social proof row (avatars + stat)

RIGHT COLUMN (45%):
  Floating detector card (white, elevated shadow)
  Two accent cards floating at corners:
    Top-right: dark charcoal "🚨 SCAM DETECTED"
    Bottom-left: white "🛡️ You're protected"
  Both cards animate: gentle float + slight rotate

BACKGROUND:
  Radial gradient from right: rgba(255,203,164,0.35) → transparent
  Grain texture overlay at 3% opacity (SVG feTurbulence)
  NO solid backgrounds, NO visible pattern lines
```

```css
.hero {
  min-height: 92vh;
  display: grid;
  grid-template-columns: 55fr 45fr;
  align-items: center;
  padding: 60px 80px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  /* Warm radial glow from right side */
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 65% 85% at 85% 50%, rgba(255,203,164,0.38) 0%, transparent 70%),
    radial-gradient(ellipse 35% 55% at 5% 85%, rgba(255,107,53,0.07) 0%, transparent 60%);
  pointer-events: none;
}

.hero-grain {
  /* Subtle paper texture */
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,..."); /* feTurbulence noise */
  pointer-events: none;
}

h1.hero-title {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: clamp(44px, 5.5vw, 76px);
  line-height: 1.03;
  letter-spacing: -2.5px;
  color: var(--charcoal);
}

h1.hero-title .accent {
  font-style: italic;
  color: var(--orange);
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 107, 53, 0.08);
  border: 1px solid rgba(255, 107, 53, 0.2);
  color: var(--orange);
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 7px 16px;
  border-radius: 999px;
  margin-bottom: 32px;
}

.hero-eyebrow-dot {
  width: 6px; height: 6px;
  background: var(--orange);
  border-radius: 50%;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

---

### 3. Buttons (Refined)

```css
/* PRIMARY — Dark charcoal (not orange — saves orange for emphasis) */
.btn-primary {
  background: var(--charcoal);
  color: var(--cream);
  font-size: 14px;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  transition: all 0.22s ease;
}
.btn-primary:hover {
  background: var(--orange);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.30);
}

/* SECONDARY — Outline */
.btn-secondary {
  background: transparent;
  color: var(--charcoal);
  font-size: 14px;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 12px;
  border: 1.5px solid rgba(28, 25, 23, 0.18);
  transition: all 0.22s ease;
}
.btn-secondary:hover {
  border-color: var(--orange);
  color: var(--orange);
  transform: translateY(-2px);
}

/* GHOST — for inline actions */
.btn-ghost {
  background: transparent;
  color: var(--orange);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 0;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: gap 0.2s;
}
.btn-ghost:hover { gap: 10px; }
```

---

### 4. Cards (Three Variants)

```css
/* STANDARD CARD — white, elevated */
.card {
  background: var(--white);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid transparent;
  box-shadow: 0 4px 24px rgba(28, 25, 23, 0.06);
  transition: all 0.28s ease;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 48px rgba(28, 25, 23, 0.1);
  border-color: rgba(255, 107, 53, 0.15);
}

/* DARK CARD — charcoal, used for featured/important content */
.card-dark {
  background: var(--charcoal);
  border-radius: 24px;
  padding: 32px;
  color: var(--cream);
}
.card-dark p { color: rgba(255, 248, 240, 0.6); }

/* ORANGE CARD — for CTAs, panic, standout features */
.card-orange {
  background: var(--orange);
  border-radius: 24px;
  padding: 32px;
  color: white;
}
.card-orange p { color: rgba(255, 255, 255, 0.75); }

/* Top accent border (audience cards) */
.card-accent-top::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--orange);
  border-radius: 24px 24px 0 0;
}
```

---

### 5. Bento Grid — Feature Section

Replace the 4-pillar uniform strip with an asymmetric bento grid:

```
┌────────────────────────────┬──────────────┬──────────────┐
│  🎭 SCAM TWIN (dark, wide) │  🤖 DETECT   │  🧬 DNA      │
│  Chat bubble preview        │  AI badge    │  bar chart   │
│  "...Barclays Fraud Team"   │  plain desc  │  preview     │
├──────────────┬─────────────┴──────────────┴──────────────┤
│  🆘 PANIC    │  🎮 GAME ZONE               📚 LEARN       │
│  (orange bg) │  (cream mid bg, spans 2)                  │
└──────────────┴────────────────────────────────────────────┘
```

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto;
  gap: 16px;
}

/* Scam Twin — dark, wide, featured */
.bento-scam-twin {
  grid-column: span 2;
  background: var(--charcoal);
  color: var(--cream);
}

/* Panic — orange */
.bento-panic {
  background: var(--orange);
  color: white;
}

/* Game Zone — spans 2 cols, cream-mid */
.bento-games {
  grid-column: span 2;
  background: var(--cream-mid);
}
```

---

### 6. Verdict Cards (Scam Detector Results)

```
┌──────────────────────────────────────────┐
│  🚨 SCAM DETECTED          [94%]  ←ring  │  ← danger red header
├──────────────────────────────────────────┤
│  ⚡ AUTHORITY IMPERSONATION   ← tactic   │
│                                          │
│  ● Urgency language          HIGH        │
│  ● Sender domain mismatch    HIGH        │
│  ● Requests personal info    HIGH        │
│  ● Unusual request time      MED         │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ "This message pretends to be     │    │  ← italic cream box
│  │  HMRC. Do not click or reply."   │    │     orange left border
│  └──────────────────────────────────┘    │
│                                          │
│  [🎭 Try Scam Twin] [📞 Report] [🔄 New]  │
└──────────────────────────────────────────┘
```

```css
.verdict-card { border-radius: 24px; overflow: hidden; }

.verdict-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.verdict-header.scam    { background: var(--danger); }
.verdict-header.suspicious { background: var(--amber); }
.verdict-header.safe    { background: var(--safe); }

.verdict-header h3 {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: white;
  font-weight: 700;
}

/* Confidence ring — SVG conic gradient */
.confidence-ring {
  width: 52px; height: 52px;
  border-radius: 50%;
  /* Replace 94% with dynamic value */
  background: conic-gradient(white 0% 94%, rgba(255,255,255,0.2) 94% 100%);
}

.tactic-badge {
  background: rgba(230, 57, 70, 0.08);
  color: var(--danger);
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 1px;
  padding: 5px 12px;
  border-radius: 999px;
  text-transform: uppercase;
}

.flag-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid var(--cream-dark);
}

.flag-dot { width: 8px; height: 8px; border-radius: 50%; }
.flag-dot.high { background: var(--danger); }
.flag-dot.med  { background: var(--amber); }
.flag-dot.low  { background: var(--safe); }

.explanation-box {
  background: var(--cream);
  border-left: 3px solid var(--orange);
  border-radius: 0 12px 12px 0;
  padding: 14px 16px;
  font-style: italic;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.7;
}
```

---

### 7. Scam Twin Chat Interface

```
Background: --charcoal (not black — warmer)
Font: DM Sans throughout
Chat bubbles:
  Scammer (left): --charcoal-mid, cream text, avatar has red ring
  User (right): --orange, white text
  Typing indicator: 3 dots, bounce animation, charcoal-mid bg

Quick reply chips:
  Cream background on charcoal = readable, distinct
  Hover: orange border, orange text
```

```css
.chat-screen {
  background: var(--charcoal);
  min-height: 70vh;
  border-radius: 24px;
  overflow: hidden;
}

.chat-header {
  background: var(--charcoal-mid);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,248,240,0.06);
}

.scammer-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--charcoal-mid);
  border: 2px solid var(--danger);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  filter: blur(0.5px); /* Slightly obscured — unknown identity */
}

.chat-bubble-scammer {
  background: var(--charcoal-mid);
  color: var(--cream);
  border-radius: 4px 18px 18px 18px;
  padding: 12px 16px;
  font-size: 14px;
  max-width: 72%;
  line-height: 1.6;
}

.chat-bubble-user {
  background: var(--orange);
  color: white;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  font-size: 14px;
  max-width: 72%;
  margin-left: auto;
  line-height: 1.6;
}

.quick-reply-chip {
  background: rgba(255,248,240,0.08);
  color: var(--cream);
  border: 1px solid rgba(255,248,240,0.15);
  font-size: 12px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-reply-chip:hover {
  border-color: var(--orange);
  color: var(--orange);
  background: rgba(255,107,53,0.08);
}
```

---

### 8. Scam DNA Result — The Shareable Card

```css
/* The card that gets screenshot-shared */
.dna-card {
  background: var(--charcoal);
  border-radius: 28px;
  padding: 40px;
  color: var(--cream);
  position: relative;
  overflow: hidden;
}

/* Decorative orange gradient top-right */
.dna-card::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%);
}

.dna-profile-name {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 900;
  font-style: italic;
  color: var(--orange);
  letter-spacing: -1px;
  margin-bottom: 4px;
}

.dna-bar-label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,248,240,0.5);
  margin-bottom: 6px;
}

.dna-bar-track {
  background: rgba(255,248,240,0.08);
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
}

.dna-bar-fill {
  height: 100%;
  border-radius: 999px;
  /* Animate from 0 to actual width */
  transition: width 1s ease;
}
.dna-bar-fill.high   { background: var(--danger); }
.dna-bar-fill.medium { background: var(--amber); }
.dna-bar-fill.low    { background: var(--safe); }
```

---

### 9. Panic Mode — Calm & Clear

```css
/* Override to feel more urgent-but-calm than the rest of the site */
.panic-page {
  background: var(--cream); /* Same bg — familiar, not alarming */
}

.panic-header-band {
  background: var(--danger);
  color: white;
  text-align: center;
  padding: 12px;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 700;
}

.panic-step-btn {
  width: 100%;
  min-height: 72px;   /* Large tap target */
  background: var(--white);
  border: 1.5px solid var(--cream-dark);
  border-radius: 16px;
  padding: 20px 24px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 16px;    /* Larger for elderly */
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.panic-step-btn:hover {
  border-color: var(--orange);
  border-left-color: var(--orange);
  transform: translateX(4px);
}

.panic-step-btn.selected {
  background: rgba(255,107,53,0.06);
  border-color: var(--orange);
  border-left-color: var(--orange);
}

.panic-script-box {
  background: var(--white);
  border-left: 5px solid var(--orange);
  border-radius: 0 20px 20px 0;
  padding: 24px 28px;
  font-size: 18px;     /* Large for urgency + elderly */
  font-weight: 500;
  line-height: 1.7;
  color: var(--charcoal);
  box-shadow: 0 8px 32px rgba(255,107,53,0.1);
}

.panic-checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: var(--white);
  border-radius: 14px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.panic-checklist-item.checked {
  background: rgba(76,175,130,0.08);
}

.panic-checkbox {
  width: 24px; height: 24px;
  border-radius: 8px;
  border: 2px solid var(--cream-dark);
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}

.panic-checkbox.checked {
  background: var(--safe);
  border-color: var(--safe);
  color: white;
}
```

---

### 10. Section Structure — Consistent Rhythm

Every section follows this pattern:

```css
/* Section opener */
.section-eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 14px;
}

.section-eyebrow::before {
  content: '';
  width: 28px; height: 1.5px;
  background: var(--orange);
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1.08;
  margin-bottom: 52px;
}

.section-title em {
  font-style: italic;
  color: var(--orange);
}
```

---

## 📐 Layout Spacing System

```css
/* Consistent spacing tokens */
--space-xs:   8px;
--space-sm:   16px;
--space-md:   28px;
--space-lg:   48px;
--space-xl:   80px;
--space-2xl:  120px;

/* Page padding (horizontal) */
--page-px: clamp(24px, 6vw, 80px);

/* Section padding (vertical) */
--section-py: clamp(60px, 10vw, 120px);
```

---

## 🌟 Micro-interaction Details

```css
/* Page transitions — Framer Motion config */
const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
}

/* Stagger children */
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
}

/* Card entrance */
const cardEntrance = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
}

/* Count-up animation (stats) — use useMotionValue */
/* Hover — all interactive cards */
whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(28,25,23,0.1)" }}
whileTap={{ scale: 0.98 }}
```

---

## 🎯 The 5 Aesthetic Rules For Every Screen

Follow these strictly when building each page:

```
1. ONE dominant colour per screen section
   Home hero → cream. Scam Twin → charcoal. Panic result → depends on verdict.

2. EVERY heading has at least one italic orange word
   "Built for everyone," → not "Built for everyone"
   "Your scam DNA" → not "Your Scam DNA"

3. SPACE Mono for ALL data, labels, numbers
   Confidence %, XP points, tags, eyebrow text, badge names

4. Dark sections ALWAYS use charcoal (#1C1917) not black
   Keeps the warmth consistent across the whole product

5. NO borders on cards unless on hover
   Clean cards float with shadow alone. Border only appears on hover/selected state.
```

---

## 🔄 Updated Build Prompt Changes

When pasting into Claude to build, add this to the top of every prompt:

```
DESIGN RULES (follow strictly):
- Font: 'Playfair Display' for headings (900 weight, italic for emphasis words)
- Font: 'DM Sans' for body text
- Font: 'Space Mono' for all labels, data, tags
- Background: always #FFF8F0 (cream), never white or grey
- Primary buttons: charcoal bg → orange on hover (NOT orange default)
- Headings always have at least one italic orange word
- Cards: no border by default, orange border on hover only
- All dark sections: #1C1917 charcoal (NOT #000000 black)
- Spacing: generous. Padding 32px+ on cards. 80px+ between sections.
- Grain texture overlay on hero at 3% opacity
- Radial gradient glow (peach/orange) behind hero visual
```

---

*Truthly Aesthetic Redesign — Editorial warmth meets precision engineering.*
*Same palette. Elevated soul.*
