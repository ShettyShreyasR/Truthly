import React from 'react';

const QUESTIONS = [
  {
    id: 'q1',
    scenario: 'You get a text: "Your parcel couldn\'t be delivered. Pay £1.45 redelivery fee: [link]"',
    emoji: '📦',
    options: [
      { text: 'Click the link — it\'s only £1.45', tags: ['urgency', 'financial'] },
      { text: 'Google the delivery company directly', tags: [] },
      { text: 'Forward to 7726 (free spam report) and delete', tags: [] },
      { text: 'Reply asking for more details', tags: ['info'] },
    ],
  },
  {
    id: 'q2',
    scenario: 'Someone on WhatsApp says they\'re your grandchild on a new number and needs £300 urgently.',
    emoji: '💬',
    options: [
      { text: 'Send the money — they sound worried', tags: ['emotional', 'financial'] },
      { text: 'Call their old number to verify', tags: [] },
      { text: 'Ask a question only they would know', tags: [] },
      { text: 'Send £50 just in case', tags: ['emotional', 'financial'] },
    ],
  },
  {
    id: 'q3',
    scenario: 'A pop-up says "VIRUS DETECTED! Call Microsoft Support: 0800-XXX immediately!"',
    emoji: '💻',
    options: [
      { text: 'Call the number straight away', tags: ['authority', 'urgency'] },
      { text: 'Close the browser tab and run my own scan', tags: [] },
      { text: 'Call a family member to ask', tags: [] },
      { text: 'Click OK to fix it automatically', tags: ['tech', 'urgency'] },
    ],
  },
  {
    id: 'q4',
    scenario: 'HMRC emails: "You\'re owed a £580 tax refund. Claim within 24 hours or it expires."',
    emoji: '📮',
    options: [
      { text: 'Click the link quickly — it expires!', tags: ['urgency', 'financial'] },
      { text: 'Log into gov.uk directly to check', tags: [] },
      { text: 'Reply to the email to verify', tags: ['info'] },
      { text: 'Ignore — HMRC would write a letter', tags: [] },
    ],
  },
  {
    id: 'q5',
    scenario: 'A caller says they\'re the police and your bank account is being used by criminals. They want you to move your savings to a "safe account".',
    emoji: '👮',
    options: [
      { text: 'Do what they say — it\'s the police!', tags: ['authority', 'financial'] },
      { text: 'Hang up and call 999 to verify', tags: [] },
      { text: 'Ask for their badge number', tags: [] },
      { text: 'Move half the money to be safe', tags: ['authority', 'financial'] },
    ],
  },
  {
    id: 'q6',
    scenario: 'You\'ve "won" a £500 supermarket voucher. You just need to pay £4.99 shipping.',
    emoji: '🎁',
    options: [
      { text: 'Pay the fee — £5 for £500 is a great deal!', tags: ['financial', 'urgency'] },
      { text: 'Check the supermarket\'s official website', tags: [] },
      { text: 'Ask a friend if they got the same offer', tags: [] },
      { text: 'Enter card details — it\'s only £4.99', tags: ['financial'] },
    ],
  },
];

function ScamDNA({ profile, onNav }) {
  const [currentQ, setCurrentQ] = React.useState(0);
  const [scores, setScores] = React.useState({
    urgency: 0, financial: 0, emotional: 0, authority: 0, tech: 0, info: 0
  });
  const [showResults, setShowResults] = React.useState(false);
  const [selectedOpt, setSelectedOpt] = React.useState(null);

  const handleSelect = (idx, tags) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    
    const newScores = { ...scores };
    tags.forEach(t => {
      if (newScores[t] !== undefined) newScores[t] += 1;
    });
    setScores(newScores);

    setTimeout(() => {
      setSelectedOpt(null);
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(q => q + 1);
      } else {
        setShowResults(true);
      }
    }, 400);
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScores({ urgency: 0, financial: 0, emotional: 0, authority: 0, tech: 0, info: 0 });
    setShowResults(false);
  };

  if (showResults) {
    const maxScorePerTag = 2; // Approximate max based on questions
    const percentages = {};
    let topTag = 'default';
    let maxPct = 0;

    Object.keys(scores).forEach(t => {
      percentages[t] = Math.min(Math.round((scores[t] / maxScorePerTag) * 100), 100);
      if (percentages[t] > maxPct) {
        maxPct = percentages[t];
        topTag = t;
      }
    });

    let profileData = { name: 'The Scam Ninja', desc: 'Excellent instincts across the board. You spotted most of the tricks.' };
    if (percentages.urgency > 40 && topTag === 'urgency') profileData = { name: 'The Quick Reactor', desc: 'You act fast under pressure — scammers exploit this with countdown timers and "act now" language.' };
    else if (percentages.financial > 40 && topTag === 'financial') profileData = { name: 'The Generous One', desc: 'Your willingness to help is a strength — but scammers target exactly this kindness.' };
    else if (percentages.authority > 40 && topTag === 'authority') profileData = { name: 'The Rule Follower', desc: 'You respect authority — scammers impersonate banks, police, and HMRC to exploit this trust.' };
    else if (percentages.emotional > 40 && topTag === 'emotional') profileData = { name: 'The Caring Heart', desc: 'Your empathy makes you a wonderful person — and a target for family emergency scams.' };
    else if (percentages.tech > 30 && topTag === 'tech') profileData = { name: 'The Tech Novice', desc: 'Tech warnings intimidate you — scammers use fake virus alerts and pop-ups to panic you.' };

    return (
      <div className="page-enter" style={{ display: 'flex', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ background: 'var(--charcoal)', color: 'var(--cream)', padding: '48px 40px', borderRadius: 24, maxWidth: 600, width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 16 }}>🧬 YOUR SCAM DNA</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontStyle: 'italic', color: 'var(--accent)', marginBottom: 12, lineHeight: 1.1 }}>{profileData.name}</div>
          <div style={{ color: 'rgba(255,248,240,0.7)', fontSize: 16, lineHeight: 1.6, marginBottom: 40 }}>{profileData.desc}</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
            {Object.keys(percentages).filter(t => percentages[t] > 0).map(t => {
              const pct = percentages[t];
              let color = 'var(--safe)';
              if (pct > 50) color = 'var(--danger)';
              else if (pct >= 20) color = 'var(--amber)';

              return (
                <div key={t}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', marginBottom: 6, color: 'var(--cream)' }}>
                    <span>{t}</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 1s ease-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => onNav('twin')}>🎭 Go to Scam Twin</button>
            <button className="btn btn-secondary" onClick={resetQuiz} style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--cream)', border: 'none' }}>🔄 Retake quiz</button>
          </div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  return (
    <div className="page-enter" style={{ display: 'flex', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase' }}>
            <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
          </div>
          <div style={{ height: 4, background: 'var(--cream-dark)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        <div className="card" style={{ padding: '48px 40px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 24, lineHeight: 1 }}>{q.emoji}</div>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--charcoal)', lineHeight: 1.5 }}>
            {q.scenario}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.options.map((opt, i) => {
            const isSelected = selectedOpt === i;
            return (
              <button
                key={i}
                onClick={() => handleSelect(i, opt.tags)}
                style={{
                  minHeight: 64,
                  padding: '16px 24px',
                  borderRadius: 16,
                  border: '1px solid var(--cream-dark)',
                  background: isSelected ? 'var(--accent)' : 'var(--white)',
                  color: isSelected ? 'var(--white)' : 'var(--charcoal)',
                  fontSize: 16,
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ScamDNA;
