# Truthly — Accessibility Panel

## What this adds

A floating button in the bottom-left corner (elderly mode only) that expands into a small panel with two controls:

1. **Text size** — four steps (Normal → Larger → Large → Very Large), persisted in localStorage so it survives page refreshes
2. **Read aloud** — reads everything visible on the current page using the browser's built-in speech engine. No API, no backend, no cost. Works offline.

---

## Files

| File | Where it goes |
|------|--------------|
| `AccessibilityPanel.jsx` | `src/components/AccessibilityPanel.jsx` |
| `AccessibilityPanel.css` (paste into index.css) | Bottom of `src/index.css` |

---

## Step 1 — Copy the component

Copy `AccessibilityPanel.jsx` into `src/components/AccessibilityPanel.jsx`.

---

## Step 2 — Add the CSS

Open `AccessibilityPanel.css`, copy everything inside it, and paste it at the very bottom of your `src/index.css` file.

---

## Step 3 — Import and add to App.jsx

```jsx
// At the top of src/App.jsx, add:
import AccessibilityPanel from './components/AccessibilityPanel';

// Then inside your main shell div, add it alongside AssistPanel:
// (it renders nothing if profile is not "elderly")

<div className="shell" data-theme={profile}>

  {/* ... all your page renders ... */}

  <AssistPanel
    profile={profile}
    currentPage={page}
    detectorContext={detectorContext}
    onNav={goto}
  />

  <AccessibilityPanel profile={profile} />

</div>
```

That's it. The component checks `profile === 'elderly'` internally and returns null in kids mode — no conditional rendering needed in App.jsx.

---

## How font scaling works

The component sets a CSS variable `--a11y-font-scale` on the `<html>` element:

```
Normal     → --a11y-font-scale: 1.0   (100%)
Larger     → --a11y-font-scale: 1.15  (115%)
Large      → --a11y-font-scale: 1.3   (130%)
Very large → --a11y-font-scale: 1.5   (150%)
```

The CSS block uses `calc(1em * var(--a11y-font-scale))` on all text elements in elderly mode, so increasing the scale lifts everything proportionally. Headings, body text, buttons, inputs, chat bubbles, contact cards — everything scales together.

The selected level is saved to `localStorage` under the key `truthly.fontLevel` so it persists when the user closes and reopens the app.

---

## How read aloud works

The component uses the **Web Speech API** (`window.speechSynthesis`) — built into Chrome, Edge, Safari, and Firefox. No external library, no API key, no network request after page load. Works completely offline.

**What it reads:** It walks through a prioritised list of CSS selectors in this order:
- Page headings (h1, h2, h3)
- Section titles
- Panic mode script text
- Explanations and analysis text
- Chat bubbles (ScamTwin)
- Tactic names and descriptions
- Contact names and descriptions
- Tool names and descriptions
- Checklist steps
- Paragraphs and list items

**What it skips:** Navigation, footer, watermarks, simulation banners, the panel itself, and any hidden elements.

**Voice settings:**
- Rate: 0.82 (slightly slower than normal — comfortable for elderly users)
- Pitch: 1.0 (natural)
- Volume: 1.0 (full)
- Voice: prefers a UK English local voice if available, falls back to any English voice

**Browser support:**
- Chrome / Edge: full support, best voice quality
- Safari: supported
- Firefox: supported but voice selection varies
- If not supported: shows "Try Chrome or Edge" message instead of the button

---

## What the panel looks like

**Collapsed (always visible in elderly mode):**
```
Bottom-left corner:
[ 👁 Accessibility ]
```

**Expanded:**
```
┌─────────────────────────────┐
│ TEXT SIZE                   │
│                             │
│  [A−]  ● ○ ○ ○  [A+]       │
│         Normal · 100%       │
│ ─────────────────────────── │
│ READ ALOUD                  │
│                             │
│ [ 🔊 Read this page      ]  │
│                             │
│ ─────────────────────────── │
│         Reset to default    │
└─────────────────────────────┘
```

**While reading:**
```
│ [ ■  Stop reading    · · · ]│
│  Reading page...            │
```

The four dots in the font size row show current level — tap any dot to jump directly to that size.

---

## Pitch notes

When showing judges, demonstrate this sequence:

1. Switch to elderly mode
2. Show the panel appears bottom-left — "It's always there, doesn't get in the way"
3. Click A+ twice — "Text scales everywhere, including buttons and inputs"
4. Click "Read this page" on the Panic mode page — "For users with visual impairment or who find reading stressful after being scammed, the app reads itself"
5. Say: "This uses the browser's built-in speech engine — no data leaves the device, works offline, no cost"

The key line for the rubric:

> "We built this for people whose hands shake, whose eyes strain, and who might be in a panic. Accessibility wasn't retrofitted — it's a first-class control that's always visible."

That directly answers the rubric criterion: **"Accessibility from the start, not retrofitted."**

---

## Troubleshooting

**Voices not loading in Chrome:**
Chrome loads voices asynchronously. The component uses a 100ms delay before speaking to handle this. If voices still sound wrong, add this to the component's `startReading` function:

```js
// Replace the setTimeout block with:
if (window.speechSynthesis.getVoices().length === 0) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    window.speechSynthesis.speak(utterance);
  }, { once: true });
} else {
  window.speechSynthesis.speak(utterance);
}
```

**Font scaling not applying:**
Make sure your root shell div has `data-theme={profile}` — all CSS rules are scoped to `[data-theme="elderly"]`. Without the attribute, the CSS selectors won't match.

**Panel overlapping with Ask Vera button:**
AssistPanel is bottom-right, AccessibilityPanel is bottom-left — they should not overlap. If your layout is different, change `.a11y-panel { left: 28px; }` to whatever position works.
