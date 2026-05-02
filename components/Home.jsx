// Home — hero + bento feature grid
function Home({ profile, onNav }) {
  const isKids = profile === 'kids';

  const heroTitle = isKids ? (
    <>Don't get<br />tricked.<br /><span className="accent-word">Get Truthly.</span></>
  ) : (
    <>Don't get<br />fooled.<br /><span className="accent-word">Get Truthly.</span></>
  );

  const subText = isKids
    ? "A friendly app that helps you spot tricky messages, fake friends, and online scams. Learn by playing — earn XP every time you spot a trick."
    : "A calm, careful companion that reads any suspicious message — text, email, voicemail — and tells you in plain English whether to trust it.";

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow-pill">
              <span className="eyebrow-dot"></span>
              {isKids ? 'AI-POWERED SIDEKICK' : 'AI-POWERED PROTECTION'}
            </span>
            <h1 className="hero-title">{heroTitle}</h1>
            <p className="hero-sub">{subText}</p>
            <div className="hero-cta-row">
              <button className="btn btn-primary" onClick={() => onNav('detector')}>
                {isKids ? 'Check a message' : 'Check a message'} →
              </button>
              <button className="btn btn-secondary" onClick={() => onNav('twin')}>
                {isKids ? 'Practice with Scam Twin' : 'Try Scam Twin'}
              </button>
            </div>
            <div className="hero-social">
              <div className="avatar-stack">
                <div style={{ background: '#FFCBA4' }}>M</div>
                <div style={{ background: '#EDD9C0' }}>J</div>
                <div style={{ background: '#FFB02E', color: '#1C1917' }}>K</div>
                <div style={{ background: '#7A5AF8', color: 'white' }}>+</div>
              </div>
              <div className="hero-social-text">
                <strong>{isKids ? '12,000+ kids' : '40,000+ people'}</strong> protected this month
              </div>
            </div>
          </div>

          <div className="hero-visual">
            {/* Floating detector preview */}
            <div className="float-card hero-detector">
              <div className="mini-detector-head">
                <span>● Truthly · Live</span>
                <span>0:03</span>
              </div>
              <div className="mini-detector-msg">
                "Your account has been suspended. Click here within 24 hours to verify your identity..."
              </div>
              <div className="mini-verdict">
                <span>{isKids ? '🚨 Tricky message' : '🚨 Scam detected'}</span>
                <span className="mini-ring"><span>94%</span></span>
              </div>
            </div>

            <div className="float-card hero-badge-scam">
              <span style={{ fontSize: 18 }}>🚨</span>
              {isKids ? 'TRICKY MESSAGE' : 'SCAM DETECTED'}
            </div>

            <div className="float-card hero-badge-safe">
              <span style={{ fontSize: 18 }}>🛡️</span>
              {isKids ? "You're safe!" : "You're protected"}
            </div>
          </div>
        </div>
      </section>

      {/* Bento feature grid */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <span className="eyebrow">{isKids ? 'YOUR TOOLKIT' : 'WHAT TRUTHLY DOES'}</span>
          <h2 className="section-title">
            {isKids ? <>Built for everyone, <span className="accent-word">made for you.</span></> : <>Built for everyone, <em>made for you.</em></>}
          </h2>

          <div className="bento">
            <div className="bento-cell bento-twin bento-wide" onClick={() => onNav('twin')}>
              <span className="bento-emoji">🎭</span>
              <div className="bento-title">{isKids ? 'Scam Twin' : 'Scam Twin'}</div>
              <p>{isKids
                ? "Chat with a pretend scammer. Spot the tricks. Get smarter every round."
                : "Practice with a safe AI scammer. Learn the patterns before you meet the real thing."
              }</p>
              <div className="mini-bubble">
                "Hi love, this is Mum — I lost my phone, can you send me £200 quickly?"
              </div>
            </div>

            <div className="bento-cell bento-detect" onClick={() => onNav('detector')}>
              <span className="bento-emoji">🤖</span>
              <div className="bento-title">{isKids ? 'Quick Check' : 'Detector'}</div>
              <p>{isKids
                ? "Paste any message. We tell you if it's safe or sneaky."
                : "Paste any text, email or voicemail transcript. Get a verdict in seconds."
              }</p>
              <div className="spacer-sm"></div>
              <span className="xp-pill">{isKids ? '+5 XP per check' : '< 2s VERDICT'}</span>
            </div>

            <div className="bento-cell bento-dna">
              <span className="bento-emoji">🧬</span>
              <div className="bento-title">{isKids ? 'Scam DNA' : 'Scam DNA'}</div>
              <p>{isKids
                ? "Every scam has a fingerprint. We show you the pattern."
                : "See the anatomy of any scam — tactics, urgency level, target type."
              }</p>
              <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
                <div style={{ flex: 1, height: 6, background: 'var(--danger)', borderRadius: 3 }}></div>
                <div style={{ flex: 1, height: 6, background: 'var(--amber)', borderRadius: 3 }}></div>
                <div style={{ flex: 0.6, height: 6, background: 'var(--cream-dark)', borderRadius: 3 }}></div>
              </div>
            </div>

            <div className="bento-cell bento-panic" onClick={() => onNav('panic')}>
              <span className="bento-emoji">🆘</span>
              <div className="bento-title">{isKids ? 'I Need Help' : 'Panic Mode'}</div>
              <p>{isKids
                ? "If something happened. Step-by-step help, no judgment."
                : "If you're worried it already happened — calm, clear next steps."
              }</p>
            </div>

            <div className="bento-cell bento-games bento-wide" onClick={() => onNav('learn')}>
              <span className="bento-emoji">{isKids ? '🎮' : '📚'}</span>
              <div className="bento-title">{isKids ? 'Game Zone' : 'Learn the patterns'}</div>
              <p>{isKids
                ? "Spot-the-scam mini games. Levels, badges, leaderboards. Get stronger every week."
                : "Short, calm lessons about the most common scams targeting people like you."
              }</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <span className="xp-pill">{isKids ? 'LEVEL 4' : '12 LESSONS'}</span>
                <span className="xp-pill" style={{ background: 'var(--charcoal)', color: 'var(--cream)' }}>
                  {isKids ? '7 BADGES' : 'AVG 3 MIN'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>© Truthly 2025 · Built for everyone</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <span className="nav-link">Privacy</span>
            <span className="nav-link">Press</span>
            <span className="nav-link">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
window.Home = Home;
