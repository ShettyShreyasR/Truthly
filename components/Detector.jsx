// Detector — paste-and-check screen with verdict
function Detector({ profile, onTryTwin, onNav }) {
  const isKids = profile === 'kids';
  const [text, setText] = React.useState('');
  const [verdict, setVerdict] = React.useState(null);
  const [analyzing, setAnalyzing] = React.useState(false);

  const samples = [
    { label: '📱 HMRC tax refund', body: "HMRC: You are owed a tax refund of £284.50. Confirm your bank details within 24 hours to receive your payment: hmrc-refund.co/verify" },
    { label: '💌 Mum text', body: "Hi love it's mum, I dropped my phone and this is my new number. Can you save it? I need a favour, ring me when you can xx" },
    { label: '🏦 Bank security', body: "Barclays Fraud Team: A payment of £540 has been attempted on your card. If this was NOT you, press 1 immediately to be connected." },
    { label: '🎁 Amazon prize', body: "Congratulations! You've been selected as our Amazon Prime customer of the day. Click here to claim your free £100 voucher before it expires!" },
  ];

  const analyze = (msg) => {
    if (!msg.trim()) return;
    setAnalyzing(true);
    setVerdict(null);
    setTimeout(() => {
      setAnalyzing(false);
      setVerdict({
        level: 'scam',
        confidence: 94,
        tactic: 'Authority Impersonation',
        flags: [
          { name: isKids ? 'Says you must hurry' : 'Urgency language', level: 'high' },
          { name: isKids ? 'Sender web address looks fake' : 'Sender domain mismatch', level: 'high' },
          { name: isKids ? 'Asks for private info' : 'Requests personal info', level: 'high' },
          { name: isKids ? 'Sent at a strange time' : 'Unusual request time', level: 'med' },
        ],
        explanation: isKids
          ? "This message is pretending to be from HMRC (the tax people). Real HMRC will never text you a link to claim a refund. Don't tap it, don't reply."
          : "This message pretends to be from HMRC. The real HMRC will never text you a link to claim a refund. Do not click, do not reply."
      });
    }, 1100);
  };

  return (
    <div className="page-enter">
      <section className="section">
        <div className="container">
          <span className="eyebrow">{isKids ? 'QUICK CHECK' : 'DETECTOR'}</span>
          <h2 className="section-title">
            {isKids ? (
              <>Paste the message. <span className="accent-word">We'll spot the trick.</span></>
            ) : (
              <>Paste the message. <em>Get a verdict.</em></>
            )}
          </h2>

          <div className="detector-wrap">
            <div className="detector-input">
              <label>{isKids ? 'PASTE A MESSAGE' : 'MESSAGE TEXT'}</label>
              <textarea
                placeholder={isKids ? "Paste a message that feels weird..." : "Paste any text, email or voicemail transcript here..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="suggested">
                <span style={{ fontSize: 12, color: 'var(--muted)', alignSelf: 'center', marginRight: 4, fontWeight: 600 }}>
                  {isKids ? 'TRY:' : 'EXAMPLES:'}
                </span>
                {samples.map((s, i) => (
                  <button key={i} className="suggested-chip" onClick={() => { setText(s.body); analyze(s.body); }}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="spacer"></div>
              <button className="btn btn-primary" onClick={() => analyze(text)} disabled={analyzing}>
                {analyzing ? (isKids ? 'Looking…' : 'Analysing…') : (isKids ? 'Check it' : 'Analyse message')} →
              </button>
            </div>

            <div>
              {!verdict && !analyzing && (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <h3 className="display" style={{ fontSize: 24, margin: '0 0 8px' }}>
                    {isKids ? 'Ready when you are' : 'Awaiting your message'}
                  </h3>
                  <p className="muted" style={{ fontSize: 14 }}>
                    {isKids
                      ? 'Paste a message on the left, or tap a try-it example.'
                      : 'Paste a message or pick an example to begin.'}
                  </p>
                </div>
              )}

              {analyzing && (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                  <h3 className="display" style={{ fontSize: 24, margin: '0 0 8px' }}>
                    {isKids ? 'Looking for tricks…' : 'Analysing patterns…'}
                  </h3>
                  <p className="muted" style={{ fontSize: 14 }}>
                    {isKids ? 'Checking 14 sneaky-message clues' : 'Checking 14 deception patterns'}
                  </p>
                  <div className="spacer-sm"></div>
                  <div style={{ height: 4, background: 'var(--cream-dark)', borderRadius: 2, overflow: 'hidden', maxWidth: 260, margin: '0 auto' }}>
                    <div style={{ height: '100%', width: '60%', background: 'var(--accent)', animation: 'bounce 1.2s ease-in-out infinite' }}></div>
                  </div>
                </div>
              )}

              {verdict && (
                <div className="verdict page-enter">
                  <div className={'verdict-head ' + verdict.level}>
                    <h3>
                      <span>🚨</span> {isKids ? 'Tricky message!' : 'Scam detected'}
                    </h3>
                    <span className="confidence-ring"><span>{verdict.confidence}%</span></span>
                  </div>
                  <div className="verdict-body">
                    <span className="tactic-badge">⚡ {verdict.tactic}</span>
                    <div>
                      {verdict.flags.map((f, i) => (
                        <div key={i} className="flag-row">
                          <span className={'flag-dot ' + f.level}></span>
                          <span className="flag-name">{f.name}</span>
                          <span className={'flag-level ' + f.level}>{f.level === 'med' ? 'medium' : f.level}</span>
                        </div>
                      ))}
                    </div>
                    <div className="explanation-box">
                      "{verdict.explanation}"
                    </div>
                    <div className="verdict-actions">
                      <button className="btn btn-primary" onClick={onTryTwin}>
                        🎭 {isKids ? 'Practice with Scam Twin' : 'Try Scam Twin'}
                      </button>
                      <button className="btn btn-secondary">
                        📞 {isKids ? 'Tell a grown-up' : 'Report it'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => { setVerdict(null); setText(''); }}>
                        🔄 {isKids ? 'New message' : 'Check another'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
window.Detector = Detector;
