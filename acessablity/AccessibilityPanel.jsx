// src/components/AccessibilityPanel.jsx
// A floating accessibility toolbar — only shows in elderly mode
// Features: font size increase/decrease, text-to-speech read aloud
// Uses the browser's built-in Web Speech API — no libraries, no backend

import { useState, useEffect, useRef, useCallback } from 'react';

// Font size steps — base is 0, each step adds one level
const FONT_SIZES = [
  { label: 'A', scale: 1.0, name: 'Normal' },
  { label: 'A', scale: 1.15, name: 'Larger' },
  { label: 'A', scale: 1.3, name: 'Large' },
  { label: 'A', scale: 1.5, name: 'Very large' },
];

// Elements to read aloud — in order of page priority
const READABLE_SELECTORS = [
  'h1', 'h2', 'h3',
  '.section-title',
  '.panic-script-text',
  '.panic-script-note',
  '.explanation-box',
  '.assist-bubble-text',
  '.chat-bubble.scammer',
  '.tactic-item .name',
  '.tactic-item .desc',
  '.contact-name',
  '.contact-desc',
  '.contact-hours',
  '.tool-name',
  '.tool-desc',
  '.panic-check-item',
  'p',
  'li',
];

export default function AccessibilityPanel({ profile }) {
  const isElderly = profile === 'elderly';

  const [open, setOpen] = useState(false);
  const [fontLevel, setFontLevel] = useState(() => {
    const saved = localStorage.getItem('truthly.fontLevel');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [speaking, setSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState('');
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef(null);
  const panelRef = useRef(null);

  // Only render in elderly mode
  if (!isElderly) return null;

  // Check browser TTS support
  useEffect(() => {
    setSupported('speechSynthesis' in window);
  }, []);

  // Apply font scale to root element
  useEffect(() => {
    const scale = FONT_SIZES[fontLevel].scale;
    document.documentElement.style.setProperty('--a11y-font-scale', scale);
    localStorage.setItem('truthly.fontLevel', fontLevel);
  }, [fontLevel]);

  // Stop speaking when panel closes
  useEffect(() => {
    if (!open && speaking) stopSpeaking();
  }, [open]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setSpeakingText('');
  };

  const getPageText = () => {
    // Collect readable text from visible page elements
    const texts = [];
    const seen = new Set();

    READABLE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Skip hidden elements, nav, footer, the panel itself, watermarks
        if (
          el.closest('.a11y-panel') ||
          el.closest('nav') ||
          el.closest('.app-footer') ||
          el.closest('.scammer-watermark') ||
          el.closest('.simulation-banner') ||
          el.closest('.detector-notice') ||
          getComputedStyle(el).display === 'none' ||
          getComputedStyle(el).visibility === 'hidden'
        ) return;

        const text = el.textContent?.trim();
        if (text && text.length > 2 && !seen.has(text)) {
          seen.add(text);
          texts.push(text);
        }
      });
    });

    return texts.join('. ');
  };

  const startReading = () => {
    if (!supported) return;
    stopSpeaking();

    const text = getPageText();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Settings optimised for elderly users
    utterance.rate = 0.82;   // slightly slower than normal
    utterance.pitch = 1.0;   // natural pitch
    utterance.volume = 1.0;  // full volume

    // Prefer a UK English voice if available
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(v =>
      v.lang === 'en-GB' && v.localService
    ) || voices.find(v =>
      v.lang === 'en-GB'
    ) || voices.find(v =>
      v.lang.startsWith('en')
    );
    if (ukVoice) utterance.voice = ukVoice;

    utterance.onstart = () => {
      setSpeaking(true);
      setSpeakingText('Reading page...');
    };
    utterance.onend = () => {
      setSpeaking(false);
      setSpeakingText('');
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setSpeakingText('');
    };

    // Chrome bug: voices load asynchronously
    // Small delay ensures voice is selected before speaking
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const handleRead = () => {
    if (speaking) {
      stopSpeaking();
    } else {
      startReading();
    }
  };

  const increaseFontSize = () => {
    setFontLevel(prev => Math.min(prev + 1, FONT_SIZES.length - 1));
  };

  const decreaseFontSize = () => {
    setFontLevel(prev => Math.max(prev - 1, 0));
  };

  const currentSize = FONT_SIZES[fontLevel];

  return (
    <div className="a11y-panel" ref={panelRef}>

      {/* ── Trigger button ── */}
      <button
        className={`a11y-fab${open ? ' a11y-fab--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Accessibility options"
        aria-expanded={open}
      >
        <span className="a11y-fab-icon" aria-hidden="true">
          {/* Eye / accessibility icon using CSS */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>
          </svg>
        </span>
        <span className="a11y-fab-label">Accessibility</span>
      </button>

      {/* ── Expanded panel ── */}
      {open && (
        <div className="a11y-dropdown" role="dialog" aria-label="Accessibility controls">

          <div className="a11y-section-label">Text size</div>

          {/* Font size controls */}
          <div className="a11y-fontsize-row">
            <button
              className="a11y-size-btn a11y-size-btn--minus"
              onClick={decreaseFontSize}
              disabled={fontLevel === 0}
              aria-label="Decrease text size"
            >
              A−
            </button>

            {/* Size dots indicator */}
            <div className="a11y-size-dots" aria-hidden="true">
              {FONT_SIZES.map((s, i) => (
                <button
                  key={i}
                  className={`a11y-size-dot${i === fontLevel ? ' active' : ''}`}
                  onClick={() => setFontLevel(i)}
                  aria-label={`Set text size to ${s.name}`}
                  title={s.name}
                />
              ))}
            </div>

            <button
              className="a11y-size-btn a11y-size-btn--plus"
              onClick={increaseFontSize}
              disabled={fontLevel === FONT_SIZES.length - 1}
              aria-label="Increase text size"
            >
              A+
            </button>
          </div>

          {/* Current size label */}
          <div className="a11y-size-label">
            {currentSize.name} · {Math.round(currentSize.scale * 100)}%
          </div>

          <div className="a11y-divider" />

          <div className="a11y-section-label">Read aloud</div>

          {/* Read aloud button */}
          {supported ? (
            <button
              className={`a11y-read-btn${speaking ? ' a11y-read-btn--active' : ''}`}
              onClick={handleRead}
              aria-label={speaking ? 'Stop reading' : 'Read page aloud'}
            >
              <span className="a11y-read-icon" aria-hidden="true">
                {speaking ? (
                  // Stop icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                ) : (
                  // Speaker icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                )}
              </span>
              <span>
                {speaking ? 'Stop reading' : 'Read this page'}
              </span>
              {speaking && (
                <span className="a11y-speaking-dots" aria-hidden="true">
                  <span/><span/><span/>
                </span>
              )}
            </button>
          ) : (
            <div className="a11y-unsupported">
              Read aloud is not supported in this browser. Try Chrome or Edge.
            </div>
          )}

          {/* Speaking status */}
          {speaking && speakingText && (
            <div className="a11y-speaking-status" role="status" aria-live="polite">
              {speakingText}
            </div>
          )}

          <div className="a11y-divider" />

          {/* Reset */}
          <button
            className="a11y-reset-btn"
            onClick={() => { setFontLevel(0); stopSpeaking(); }}
          >
            Reset to default
          </button>

        </div>
      )}
    </div>
  );
}
