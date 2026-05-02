// Learn / Game Zone — kids gamified, elderly editorial
function Learn({ profile, onNav }) {
  const isKids = profile === 'kids';
  const [score, setScore] = React.useState(0);
  const [picked, setPicked] = React.useState(null);

  const quiz = {
    msg: isKids
      ? "Hey! It's Sam from your class. I made a new account — add me back? Send me your username & password so I can find you faster!"
      : "Dear customer, your TV licence has expired. To continue watching, please verify your direct debit details at tvlicensing-renew.com — last warning.",
    options: [
      { id: 'a', text: isKids ? 'Trust it — sounds friendly' : 'Click and renew, just in case', correct: false },
      { id: 'b', text: isKids ? 'Never share passwords. Ignore.' : "Don't click — visit tvlicensing.co.uk directly", correct: true },
      { id: 'c', text: isKids ? 'Reply asking who it really is' : 'Reply to ask if it is real', correct: false },
    ]
  };

  const lessons = [
    { emoji: '🎭', title: isKids ? 'The Family Trick' : 'Impersonation scams', length: isKids ? '3 min · +20 XP' : '3 MIN · 4 EXAMPLES' },
    { emoji: '🏦', title: isKids ? 'Bank Pretender' : 'Bank impersonation', length: isKids ? '4 min · +25 XP' : '4 MIN · 5 EXAMPLES' },
    { emoji: '🎁', title: isKids ? 'The Free Stuff Trap' : 'Prize & lottery scams', length: isKids ? '3 min · +20 XP' : '3 MIN · 6 EXAMPLES' },
    { emoji: '💕', title: isKids ? 'Fake Friends Online' : 'Romance & friendship scams', length: isKids ? '5 min · +30 XP' : '5 MIN · 4 EXAMPLES' },
  ];

  const choose = (opt) => {
    setPicked(opt);
    if (opt.correct) setScore(s => s + (isKids ? 25 : 1));
  };

  return (
    <div className="page-enter">
      <section className="section">
        <div className="container">
          <span className="eyebrow">{isKids ? 'GAME ZONE' : 'LEARN THE PATTERNS'}</span>
          <h2 className="section-title">
            {isKids
              ? <>Spot the trick, <span className="accent-word">earn XP.</span></>
              : <>Short lessons. <em>Real protection.</em></>
            }
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'start' }}>
            <div className="game-card">
              <div className="row-between" style={{ marginBottom: 20 }}>
                <span className="eyebrow-pill">
                  <span className="eyebrow-dot"></span>
                  {isKids ? 'DAILY CHALLENGE' : 'TODAY\'S EXAMPLE'}
                </span>
                {isKids && <span className="xp-pill">{score} XP</span>}
              </div>
              <div style={{
                background: 'var(--cream)',
                borderRadius: 16,
                padding: 20,
                borderLeft: '4px solid var(--accent)',
                fontSize: 16,
                lineHeight: 1.6,
                fontStyle: isKids ? 'normal' : 'italic',
                marginBottom: 20,
              }}>
                "{quiz.msg}"
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                {isKids ? 'What do you do?' : 'What is the right move?'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {quiz.options.map(o => {
                  const isPicked = picked && picked.id === o.id;
                  const reveal = picked != null;
                  let bg = 'var(--white)';
                  let border = '1.5px solid var(--cream-dark)';
                  if (reveal && o.correct) { bg = 'rgba(76,175,130,0.10)'; border = '2px solid var(--safe)'; }
                  else if (reveal && isPicked && !o.correct) { bg = 'rgba(230,57,70,0.08)'; border = '2px solid var(--danger)'; }
                  return (
                    <button key={o.id}
                      onClick={() => !picked && choose(o)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 14,
                        background: bg,
                        border,
                        textAlign: 'left',
                        fontSize: 15,
                        fontWeight: 500,
                        cursor: picked ? 'default' : 'pointer',
                        color: 'var(--charcoal)',
                        transition: 'all 0.2s',
                      }}>
                      {o.text} {reveal && o.correct && ' ✓'} {reveal && isPicked && !o.correct && ' ✗'}
                    </button>
                  );
                })}
              </div>
              {picked && (
                <div className="explanation-box" style={{ marginTop: 18 }}>
                  {picked.correct
                    ? (isKids ? "🎉 Nice! Real friends never need your password. +25 XP" : "Correct. Always go directly to the official site — never via a link in a message.")
                    : (isKids ? "Not quite. Real friends never need your password. Try again tomorrow!" : "Not quite. Always go directly to the official site — never via a link.")
                  }
                </div>
              )}
            </div>

            <div>
              <h3 className="display" style={{ fontSize: 22, margin: '0 0 16px', letterSpacing: '-0.5px' }}>
                {isKids ? 'Levels & Lessons' : 'Topics'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lessons.map((l, i) => (
                  <div key={i} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 28 }}>{l.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{l.title}</div>
                      <div className="muted" style={{
                        fontSize: 11,
                        marginTop: 2,
                        fontFamily: isKids ? 'var(--font-body)' : 'var(--font-mono)',
                        letterSpacing: isKids ? 0.5 : 1.2,
                        textTransform: 'uppercase',
                        fontWeight: isKids ? 800 : 600,
                      }}>{l.length}</div>
                    </div>
                    <span style={{ color: 'var(--accent)', fontSize: 18 }}>→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
window.Learn = Learn;
