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
          Truthly adapts to who you are. Pick a profile so the app fits the way you read,
          tap, and learn. You can change it anytime.
        </p>

        <div className="profile-options">
          <button className="profile-option elderly-preview" onClick={() => onPick('elderly')}>
            <span className="profile-option-emoji">🫖</span>
            <div className="profile-option-name">For grown-ups <em>& seniors</em></div>
            <p className="profile-option-desc">
              Calm, editorial design. Larger text, simpler steps, careful language —
              built for confident, deliberate use.
            </p>
            <div className="profile-option-feats">
              <div className="profile-option-feat">Larger 18px reading size</div>
              <div className="profile-option-feat">Plain English, no jargon</div>
              <div className="profile-option-feat">Calm cream & charcoal palette</div>
            </div>
          </button>

          <button className="profile-option kids-preview" onClick={() => onPick('kids')}>
            <span className="profile-option-emoji">🦊</span>
            <div className="profile-option-name">For kids <em>& teens</em></div>
            <p className="profile-option-desc">
              Bright, friendly, gamified. Practice spotting tricks with the Scam Twin and
              earn points learning to stay safe online.
            </p>
            <div className="profile-option-feats">
              <div className="profile-option-feat">Earn XP & unlock badges</div>
              <div className="profile-option-feat">Friendly, simple language</div>
              <div className="profile-option-feat">Playful purple, teal & sunshine</div>
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

window.Onboarding = Onboarding;
