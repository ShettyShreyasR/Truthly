// Panic — calm step-by-step incident help
function Panic({ profile, onNav }) {
  const isKids = profile === 'kids';
  const [step, setStep] = React.useState(null);
  const [checks, setChecks] = React.useState({});

  const steps = isKids ? [
    { id: 'told', emoji: '💬', label: 'I gave them my password or info' },
    { id: 'paid', emoji: '💸', label: 'I sent them money or a gift card' },
    { id: 'tapped', emoji: '👆', label: 'I tapped a weird link' },
    { id: 'unsure', emoji: '🤔', label: "I'm not sure what happened" },
  ] : [
    { id: 'shared', emoji: '🔓', label: 'I shared bank details or a code' },
    { id: 'paid', emoji: '💸', label: 'I transferred money to them' },
    { id: 'clicked', emoji: '🔗', label: 'I clicked a suspicious link' },
    { id: 'unsure', emoji: '🤔', label: "I'm not sure what happened" },
  ];

  const checklists = {
    shared: [
      isKids ? 'Tell a parent or guardian right now' : 'Call your bank using the number on the back of your card',
      isKids ? 'Change your password (ask a grown-up)' : 'Change your online banking password',
      isKids ? 'Block the person who messaged you' : 'Block the sender on phone & email',
      isKids ? 'Tell your school if it might affect them' : 'Report to Action Fraud (0300 123 2040)',
    ],
    paid: [
      isKids ? 'Tell a parent or guardian right now' : 'Call your bank — they may be able to recall the payment',
      isKids ? 'Take a screenshot of the messages' : 'Take screenshots of every message',
      isKids ? 'Block the contact' : 'Report to Action Fraud (0300 123 2040)',
      isKids ? 'Save the bank details they gave you' : 'Note the account details they gave you',
    ],
    clicked: [
      isKids ? 'Close the page right away' : 'Close the page — do not enter anything',
      isKids ? 'Tell a grown-up what you saw' : 'Run a security scan on your device',
      isKids ? 'If you typed a password, change it' : 'Change the password for any account you may have entered',
      isKids ? 'Take a screenshot of the link' : 'Check your bank statement over the next 7 days',
    ],
    tapped: [
      'Close the page right away',
      'Tell a grown-up what you saw',
      'If you typed a password, change it',
      'Take a screenshot of the link',
    ],
    told: [
      'Tell a parent or guardian right now',
      'Change your password (ask a grown-up)',
      'Block the person who messaged you',
      'Tell your school if it might affect them',
    ],
    unsure: [
      isKids ? 'Take a screenshot of everything' : 'Take screenshots before anything is deleted',
      isKids ? 'Tell a grown-up what feels wrong' : 'Note down what happened and when',
      isKids ? "Don't reply to the person again" : 'Stop replying to the contact',
      isKids ? 'We can walk you through it' : 'Call our calm-line for guidance: 0808 000 1010',
    ],
  };

  const scripts = {
    shared: isKids
      ? "Take a deep breath. You did the right thing by coming here. Now find a grown-up and tell them — they won't be cross."
      : "Take a breath. You're not in trouble — you're going to call the bank now using the number on the back of your card. Don't use any number from the message itself.",
    paid: isKids
      ? "Take a deep breath. We can fix this together — but you need to tell a grown-up right now so they can call the bank."
      : "Take a breath. The next 30 minutes matter most. Call your bank's fraud line on the number on your card and ask them to recall the payment. Many do.",
    clicked: isKids
      ? "It's okay. Close the page. Then go find a grown-up — even if you feel silly. You didn't do anything wrong."
      : "Take a breath. Close the page first. If you didn't enter any details, you're likely fine — but we'll still walk you through some checks.",
    tapped: "It's okay. Close the page. Then go find a grown-up — even if you feel silly. You didn't do anything wrong.",
    told: "Take a deep breath. You did the right thing by coming here. Now find a grown-up and tell them — they won't be cross.",
    unsure: isKids
      ? "That's okay. We'll figure it out together. First, don't reply to whoever it was. Then tell a grown-up what feels off."
      : "Take a breath. You don't need to know what happened to start the right steps. Stop replying first — we'll handle the rest.",
  };

  return (
    <div className="page-enter">
      <div className="panic-band">
        <span style={{ fontSize: 14 }}>●</span>
        {isKids ? "YOU'RE OKAY · WE'LL HELP" : "YOU'RE NOT IN TROUBLE · STAY WITH US"}
        <span style={{ fontSize: 14 }}>●</span>
      </div>
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container">
          <span className="eyebrow">{isKids ? 'I NEED HELP' : 'PANIC MODE'}</span>
          <h2 className="section-title">
            {isKids
              ? <>Tell us what <span className="accent-word">just happened.</span></>
              : <>Tell us what <em>just happened.</em></>
            }
          </h2>

          <div className="panic-grid">
            <div>
              {steps.map(s => (
                <button key={s.id}
                  className={'panic-step-btn' + (step === s.id ? ' selected' : '')}
                  onClick={() => { setStep(s.id); setChecks({}); }}>
                  <span className="panic-step-emoji">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <div>
              {!step && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🫂</div>
                  <h3 className="display" style={{ fontSize: 22, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                    {isKids ? "We're here." : "You're safe here."}
                  </h3>
                  <p className="muted" style={{ fontSize: 15 }}>
                    {isKids ? "Tap whichever feels closest. We won't judge." : 'Pick whichever feels closest — we adjust the steps to match.'}
                  </p>
                </div>
              )}

              {step && (
                <div className="page-enter" key={step}>
                  <div className="panic-script">{scripts[step]}</div>
                  <div className="panic-checklist">
                    {checklists[step].map((c, i) => (
                      <div key={i}
                        className={'panic-check-item' + (checks[i] ? ' checked' : '')}
                        onClick={() => setChecks({ ...checks, [i]: !checks[i] })}>
                        <span className={'panic-checkbox' + (checks[i] ? ' checked' : '')}>
                          {checks[i] ? '✓' : ''}
                        </span>
                        <span style={{ flex: 1 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="spacer"></div>
                  <div className="row" style={{ flexWrap: 'wrap' }}>
                    <button className="btn btn-danger">
                      📞 {isKids ? 'Call a grown-up now' : 'Call my bank'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => onNav('home')}>
                      I'm okay — back home
                    </button>
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
window.Panic = Panic;
