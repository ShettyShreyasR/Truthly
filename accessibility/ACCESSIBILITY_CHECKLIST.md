# Accessibility Checklist for Developers

Use this checklist when adding new features or components to Truthly.

## Before Coding

- [ ] Will this feature be used by seniors? (Assume yes if uncertain)
- [ ] Does it involve text? (Must be ≥18px in elderly mode)
- [ ] Does it involve buttons/clickables? (Must be ≥48×48px)
- [ ] Does it involve form inputs? (Must be ≥56px tall)
- [ ] Did you check the Accessibility Guidelines?

## During Development

### Text & Typography
- [ ] Body text: 18px+ in elderly mode
- [ ] Headings: 24px+ (h3), 32px+ (h2), 42px+ (section title)
- [ ] Mono labels: 13px minimum (no smaller)
- [ ] Line height: ≥1.8 for body text
- [ ] Contrast ratio: ≥4.5:1 for normal text

### Buttons & Interactive
- [ ] All buttons: ≥48×48px (preferably 56px)
- [ ] All buttons: ≥18px font (elderly mode)
- [ ] All links: Underlined or visually distinct
- [ ] Focus ring: Visible, ≥3px thick
- [ ] Hover state: Clear visual feedback

### Forms
- [ ] Input height: ≥56px in elderly mode
- [ ] Input font: ≥18px in elderly mode
- [ ] Labels: Large, clear, always present
- [ ] Placeholder: Not the only label
- [ ] Error messages: ≥18px, high contrast

### Layout & Spacing
- [ ] Section padding: ≥56px top/bottom
- [ ] Card gaps: ≥20px
- [ ] Line spacing: ≥1.8
- [ ] No cramped layouts
- [ ] Breathing room around elements

### Color & Contrast
- [ ] No color-only indicators (use text or shape too)
- [ ] Contrast checked with Contrast Checker tool
- [ ] Gray text (muted): Still ≥4.5:1
- [ ] Links: Visually distinct (not color-only)

### Keyboard & Navigation
- [ ] Tab order: Logical and intuitive
- [ ] All interactive elements: Keyboard accessible
- [ ] No keyboard traps
- [ ] Focus always visible
- [ ] Escape key closes modals

### Mobile & Responsive
- [ ] Touch targets: ≥44×44px on mobile
- [ ] Landscape mode: Still readable
- [ ] Zoom to 200%: Still usable (no horizontal scroll)
- [ ] One-handed usage: Possible
- [ ] Screen readers: Compatible

## Testing

### Visual Testing
- [ ] Zoom to 150%: Readable?
- [ ] Zoom to 200%: Still usable?
- [ ] Remove colors: Still understandable?
- [ ] Old glasses on: Still readable?
- [ ] Bright sunlight: Still visible?

### Keyboard Testing
- [ ] Tab through page: Logical order?
- [ ] All buttons accessible: Via keyboard?
- [ ] Focus visible: Every step?
- [ ] Escape key: Works as expected?
- [ ] No sticky focus: Moves smoothly?

### Accessibility Tools
- [ ] axe DevTools: No critical errors
- [ ] WAVE: No red errors
- [ ] Contrast Checker: All text ≥4.5:1
- [ ] Screen reader: Basic test (NVDA/JAWS)
- [ ] Mobile: Testing on 5+ devices

## CSS Rules

### When adding new styles:

```css
/* WRONG ❌ — only works in default mode */
.my-button {
  font-size: 14px;
  padding: 8px 12px;
}

/* CORRECT ✅ — works in elderly mode too */
.my-button {
  font-size: 16px;
  padding: 12px 20px;
  min-height: 44px;
}

[data-theme="elderly"] .my-button {
  font-size: 20px;
  padding: 16px 28px;
  min-height: 56px;
}
```

### Good defaults (before elderly override):
- Buttons: `16px`, `44px` height, `12px` padding
- Text: `14px`, `1.6` line height
- Inputs: `16px`, `44px` height, `12px` padding
- Cards: `16px` padding, `12px` gaps

### Elderly overrides (in elderly section):
- Buttons: `20px`, `56px` height, `16px` padding
- Text: `18px-20px`, `1.75-1.85` line height
- Inputs: `20px`, `56px` height, `16px` padding
- Cards: `24px+` padding, `20px+` gaps

## Code Review Checklist

When reviewing pull requests:

### Accessibility
- [ ] Font sizes increased in elderly mode?
- [ ] Touch targets ≥48px base, ≥56px elderly?
- [ ] Line heights ≥1.6 base, ≥1.75 elderly?
- [ ] Contrast ratio ≥4.5:1?
- [ ] Focus visible when tabbing?
- [ ] Keyboard accessible?
- [ ] Mobile friendly?

### Code Quality
- [ ] CSS scoped to `[data-theme="elderly"]` where needed?
- [ ] No hardcoded colors (use CSS variables)?
- [ ] No magic numbers (use spacing scale)?
- [ ] Comments for complex accessibility changes?
- [ ] No temporary disables of accessibility?

### Testing
- [ ] Tested in elderly mode?
- [ ] Tested on mobile?
- [ ] Tested with keyboard?
- [ ] Tested with zoom 150%+?
- [ ] Tested with high contrast?

## Common Pitfalls ❌

### Too Small Text
```css
/* Bad */
[data-theme="elderly"] .small-note {
  font-size: 12px;  /* Violates minimum 13px rule */
}

/* Good */
[data-theme="elderly"] .small-note {
  font-size: 15px;  /* Meets 13px minimum */
}
```

### Insufficient Padding
```css
/* Bad */
[data-theme="elderly"] .button {
  padding: 8px 12px;  /* Looks cramped */
}

/* Good */
[data-theme="elderly"] .button {
  padding: 16px 28px;  /* Spacious, clear */
}
```

### Low Contrast
```css
/* Bad */
[data-theme="elderly"] .muted-text {
  color: #aaa;  /* Too light, <4.5:1 contrast */
}

/* Good */
[data-theme="elderly"] .muted-text {
  color: #666;  /* Better contrast, still muted */
}
```

### Color-Only Indicator
```jsx
<!-- Bad -->
<div style={{ color: 'red' }}>Error</div>  {/* Colorblind users miss it */}

<!-- Good -->
<div>
  <span style={{ color: 'red' }}>⚠️</span>
  <span>Error occurred</span>  {/* Visible to everyone */}
</div>
```

### Missing Focus
```css
/* Bad */
[data-theme="elderly"] button:focus {
  outline: none;  /* No focus indicator */
}

/* Good */
[data-theme="elderly"] button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [NHS Accessibility Guidelines](https://www.nhs.uk/accessible-guidance/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)

## Questions?

See `SENIOR_ACCESSIBILITY_GUIDE.md` for full documentation and standards met.

---

**Last Updated**: May 3, 2026  
**Status**: WCAG AAA Compliant ✅
