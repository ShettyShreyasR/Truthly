import React from 'react';
import { detectScam } from '../utils/api';

// Detector — paste-and-check screen with verdict
function Detector({ profile, onTryTwin, onNav, apiStatus, onContextChange }) {
  const isKids = profile === 'kids';
  const [text, setText] = React.useState('');
  const [verdict, setVerdict] = React.useState(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [doneTodos, setDoneTodos] = React.useState([]);

  const ANALYZING_MESSAGES_ADULT = [
    'Reading the message…',
    'Checking for red flags…',
    'Analysing sender patterns…',
    'Cross-referencing scam database…',
    'Preparing verdict…',
  ];

  const ANALYZING_MESSAGES_KIDS = [
    'Looking for tricks…',
    'Checking if it seems friendly or fake…',
    'Spotting sneaky patterns…',
    'Almost done…',
  ];

  const [analyzeStep, setAnalyzeStep] = React.useState(0);

  React.useEffect(() => {
    if (!analyzing) { setAnalyzeStep(0); return; }
    const interval = setInterval(() => {
      setAnalyzeStep(s => {
        const max = isKids ? ANALYZING_MESSAGES_KIDS.length : ANALYZING_MESSAGES_ADULT.length;
        return s < max - 1 ? s + 1 : s;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [analyzing, isKids]);

  React.useEffect(() => { setDoneTodos([]); }, [verdict]);

  const samples = [
    { label: '📱 HMRC tax refund', body: "HMRC: You are owed a tax refund of £284.50. Confirm your bank details within 24 hours to receive your payment: hmrc-refund.co/verify" },
    { label: '💌 Mum text', body: "Hi love it's mum, I dropped my phone and this is my new number. Can you save it? I need a favour, ring me when you can xx" },
    { label: '🏦 Bank security', body: "Barclays Fraud Team: A payment of £540 has been attempted on your card. If this was NOT you, press 1 immediately to be connected." },
    { label: '🎁 Amazon prize', body: "Congratulations! You've been selected as our Amazon Prime customer of the day. Click here to claim your free £100 voucher before it expires!" },
  ];

  const MOCK_VERDICTS = {
    default: {
      level: 'scam',
      confidence: 89,
      tactic: 'Demo Mode — Connect API for real analysis',
      flags: [
        { name: 'DEMO: Urgency language detected', level: 'high' },
        { name: 'DEMO: Suspicious sender pattern', level: 'high' },
        { name: 'DEMO: Requests personal information', level: 'med' },
      ],
      explanation: 'This is a demo result. Connect the Truthly API for real AI-powered analysis.',
      what_to_do: ['Do not click any links', 'Verify by calling the official number', 'Report to Action Fraud: 0300 123 2040'],
    }
  };

  const analyze = async (msg) => {
    if (!msg.trim()) return;
    setAnalyzing(true);
    setVerdict(null);
    setError(null);

    try {
      if (apiStatus === 'down') {
        setTimeout(() => {
          setVerdict(MOCK_VERDICTS.default);
          setAnalyzing(false);
        }, 1100);
        return;
      }

      const data = await detectScam(msg, profile);
      setVerdict(data);
    } catch (err) {
      setError(
        isKids
          ? "Hmm, I couldn't check that message right now. Try again in a moment!"
          : "Unable to analyse right now — please try again in a moment."
      );
    } finally {
      if (apiStatus !== 'down') setAnalyzing(false);
    }
  };

  let vc = null;
  if (verdict) {
    const verdictConfig = {
      scam:       { icon: '🚨', label: isKids ? 'Tricky message!' : 'Scam detected' },
      suspicious: { icon: '⚠️', label: isKids ? 'Bit suspicious...' : 'Looks suspicious' },
      safe:       { icon: '✅', label: isKids ? 'Looks okay!' : 'Looks safe' },
    };
    vc = verdictConfig[verdict.level] || verdictConfig.scam;
  }

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
              {apiStatus === 'down' && (
                <div style={{
                  background: 'rgba(255,183,3,0.12)',
                  border: '1px solid var(--amber)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 12,
                  color: 'var(--charcoal)',
                  marginBottom: 16,
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                }}>
                  <span>⚠️</span>
                  <span>
                    {isKids
                      ? 'The checker is taking a nap right now. Try the example messages!'
                      : 'AI backend offline — using demo mode. Results are illustrative only.'}
                  </span>
                </div>
              )}
              <label>{isKids ? 'PASTE A MESSAGE' : 'MESSAGE TEXT'}</label>
              <textarea
                placeholder={isKids ? "Paste a message that feels weird..." : "Paste any text, email or voicemail transcript here..."}
                value={text}
                onChange={(e) => { setText(e.target.value); onContextChange && onContextChange(e.target.value); }}
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
              {error && !verdict && !analyzing && (
                <div className="card" style={{ textAlign: 'center', padding: 40, borderLeft: '4px solid var(--amber)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                  <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px' }}>
                    {isKids ? 'Oops!' : 'Connection issue'}
                  </h3>
                  <p className="muted" style={{ fontSize: 14 }}>{error}</p>
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginTop: 16 }}
                    onClick={() => { setError(null); analyze(text); }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {!verdict && !analyzing && !error && (
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
                    {isKids ? ANALYZING_MESSAGES_KIDS[analyzeStep] : ANALYZING_MESSAGES_ADULT[analyzeStep]}
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
                      <span>{vc.icon}</span> {vc.label}
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
                    
                    {verdict.what_to_do && verdict.what_to_do.length > 0 && (
                      <div style={{ marginTop: 16, marginBottom: 8 }}>
                        <div style={{ 
                          fontSize: 11, fontFamily: 'var(--font-mono)', 
                          letterSpacing: 1.5, textTransform: 'uppercase',
                          color: 'var(--muted)', marginBottom: 10, fontWeight: 700
                        }}>
                          {isKids ? 'WHAT TO DO NOW' : 'NEXT STEPS'}
                        </div>
                        {verdict.what_to_do.map((step, i) => (
                          <div
                            key={i}
                            onClick={() => setDoneTodos(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i])}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: 12,
                              padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                              background: doneTodos.includes(i) ? 'rgba(76,175,130,0.08)' : 'var(--cream)',
                              cursor: 'pointer', transition: 'background 0.2s',
                              fontSize: 13, lineHeight: 1.5,
                            }}
                          >
                            <span style={{
                              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                              border: `2px solid ${doneTodos.includes(i) ? 'var(--safe)' : 'var(--cream-dark)'}`,
                              background: doneTodos.includes(i) ? 'var(--safe)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: 11, fontWeight: 900, marginTop: 1,
                              transition: 'all 0.2s',
                            }}>
                              {doneTodos.includes(i) ? '✓' : ''}
                            </span>
                            <span style={{ color: doneTodos.includes(i) ? 'var(--muted)' : 'var(--charcoal)' }}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

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
                    <div className="ethics-note">
                      <span style={{ fontSize: 14 }}>ℹ️</span>
                      <span>
                        {isKids
                          ? "Truthly gives you a second opinion — always tell a grown-up too."
                          : "Truthly is a second opinion, not a final answer. When in doubt, call the official number directly — never one from the message itself."}
                      </span>
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

export default Detector;
