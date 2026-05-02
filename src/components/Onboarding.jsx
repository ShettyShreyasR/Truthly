import React from 'react';

// Onboarding — first-visit profile picker
function Onboarding({ onPick }) {
  return (
    <div className="onboard-overlay">
      <div className="onboard-card page-enter">
        <span className="eyebrow-pill onboard-eyebrow">
          <span className="eyebrow-dot"></span>
          WELCOME TO TRUTHLY
        </span>
        <h1 className="onboard-title">
          Who are we<br />
          protecting <em className="accent-word">today?</em>
        </h1>
        <p className="onboard-sub">
          Over £580 million was lost to scams in the UK last year. 
          Truthly is built for the two groups most at risk — 
          and least served by existing tools.
        </p>

        <div className="profile-options">
          <button className="profile-option elderly-preview" onClick={() => onPick('elderly')}>
            <span className="profile-option-emoji">🫖</span>
            <div className="profile-option-name">For grown-ups <em>& seniors</em></div>
            <p className="profile-option-desc">
              Built for people who've been targeted by phone scams, fake bank calls, and 
              suspicious texts — and want a calm, clear way to check before they act.
            </p>
            <div className="profile-option-feats">
              <div className="profile-option-feat">Plain English, no technical jargon</div>
              <div className="profile-option-feat">Step-by-step help if something's already happened</div>
              <div className="profile-option-feat">Builds confidence — not dependence</div>
            </div>
          </button>

          <button className="profile-option kids-preview" onClick={() => onPick('kids')}>
            <span className="profile-option-emoji">🦊</span>
            <div className="profile-option-name">For kids <em>& teens</em></div>
            <p className="profile-option-desc">
              For children and teens navigating gaming scams, fake friends online, and 
              'too good to be true' messages. Learn the patterns before they affect you.
            </p>
            <div className="profile-option-feats">
              <div className="profile-option-feat">Practice spotting tricks safely</div>
              <div className="profile-option-feat">Earn XP for smart decisions</div>
              <div className="profile-option-feat">Designed with teachers and parents in mind</div>
            </div>
          </button>
        </div>

        <div className="spacer"></div>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Built for everyone. No account needed to try.
        </p>
      </div>
    </div>
  );
}

export default Onboarding;
