// ScamTwin — practice room with profile-specific scenarios
const TWIN_SCENARIOS = {
  elderly: [
    {
      id: 'family',
      emoji: '👩‍👦',
      title: 'The "new number" Mum',
      blurb: 'A text from someone claiming to be a relative on a new phone, asking for money.',
      difficulty: 'Common',
      avatar: '👤',
      contact: '"Mum" — +44 7700 900xxx',
      opener: [
        "Hi love, this is Mum. I've lost my phone, this is my new number. Save it would you?",
        "Actually while you're there — I'm in a bit of bother. Could you transfer me £250 to this account? I'll explain later. Mum xx",
      ],
      tactics: [
        { id: 'authority', name: 'Family impersonation', desc: 'Claims to be a known family member' },
        { id: 'urgency', name: 'Manufactured urgency', desc: 'Quickly, now — pressure language' },
        { id: 'money', name: 'Money request', desc: 'Specific sum, immediate transfer' },
        { id: 'channel', name: 'Unverified channel', desc: 'Switched to unknown phone' },
      ],
      replies: [
        { id: 'amount', text: "Why £250? What's the trouble?", spots: ['money', 'urgency'] },
        { id: 'verify', text: "What's our family password?", spots: ['authority'] },
        { id: 'call', text: "I'll call your old number to check.", spots: ['authority', 'channel'] },
        { id: 'send', text: "Sending now Mum, hold on!", spots: [] },
      ],
      pressure: "Why are you being like this? It's me, just send the money please. I'm panicking here.",
      payoff: "Thank you darling. Send to sort code 09-22-14, account 17284091. Quick as you can.",
    },
    {
      id: 'bank',
      emoji: '🏦',
      title: 'Barclays "fraud team"',
      blurb: 'A caller claiming to be from your bank, warning of suspicious activity on your account.',
      difficulty: 'Aggressive',
      avatar: '🏦',
      contact: '"Barclays Fraud" — 0345 7345…',
      opener: [
        "Good afternoon. This is Andrew from the Barclays Fraud Team. We've spotted a payment of £540 leaving your account in Manchester — was this you?",
        "For your safety I'll need to move your funds to a new secure account. Could you confirm your card number and the security code on the back?",
      ],
      tactics: [
        { id: 'authority', name: 'Authority impersonation', desc: 'Claims to be your bank' },
        { id: 'fear', name: 'Fear & alarm', desc: 'Sudden alleged fraud — panic response' },
        { id: 'creds', name: 'Asks for credentials', desc: 'Card number, PIN, security code' },
        { id: 'safe-account', name: '"Safe account" fraud', desc: 'Wants you to move money "for safety"' },
      ],
      replies: [
        { id: 'callback', text: "I'll hang up and call the number on my card.", spots: ['authority'] },
        { id: 'no-creds', text: "I won't share my card details over the phone.", spots: ['creds'] },
        { id: 'safe', text: "Banks never ask you to move money to stay safe.", spots: ['safe-account', 'fear'] },
        { id: 'comply', text: "My card number is 4929…", spots: [] },
      ],
      pressure: "Sir, every minute you delay, more money leaves your account. I'm trying to help you.",
      payoff: "Thank you. Now please move your savings to sort code 23-05-80, account 90014725. We'll move it back tomorrow.",
    },
    {
      id: 'hmrc',
      emoji: '📮',
      title: 'HMRC tax refund',
      blurb: 'A polite letter-style email saying you are owed a refund — just confirm your details.',
      difficulty: 'Subtle',
      avatar: '📨',
      contact: '"HMRC Refunds" — refunds@hmrc-uk.co',
      opener: [
        "Dear taxpayer, our records show you are entitled to a tax refund of £284.50 for the 2023/24 financial year.",
        "To process your refund, kindly confirm your name, date of birth, and bank account details by replying to this message within 24 hours.",
      ],
      tactics: [
        { id: 'authority', name: 'Government impersonation', desc: 'Pretends to be HMRC' },
        { id: 'reward', name: 'Refund / reward bait', desc: 'Promises money to lure response' },
        { id: 'creds', name: 'Asks for personal info', desc: 'DOB and bank details' },
        { id: 'urgency', name: 'Time pressure', desc: '"Within 24 hours"' },
      ],
      replies: [
        { id: 'gov', text: "I'll log into gov.uk directly to check.", spots: ['authority'] },
        { id: 'info', text: "HMRC already has my details — they wouldn't ask.", spots: ['creds'] },
        { id: 'domain', text: "That email address looks wrong.", spots: ['authority'] },
        { id: 'reply', text: "My DOB is 14/06/1958, account…", spots: [] },
      ],
      pressure: "Please confirm quickly so we may release your refund. The 24-hour window is closing.",
      payoff: "Thank you. Your refund will be issued. Please also confirm your sort code and online banking password to verify identity.",
    },
  ],

  kids: [
    {
      id: 'gamer',
      emoji: '🎮',
      title: 'Free V-Bucks!',
      blurb: 'A new "friend" in your game says they can get you free in-game money — just share your login.',
      difficulty: 'Beginner',
      avatar: '🕹️',
      contact: 'XxFreeBucks_King · DM',
      opener: [
        "yo bro!! 🎮 I have an EXTRA 13,500 V-Bucks I literally can't use. Want them free??",
        "just give me ur Epic username + password rq, I log in, drop the bucks, log out 👍 takes 30 secs",
      ],
      tactics: [
        { id: 'reward', name: 'Free stuff bait', desc: 'Free V-Bucks/skins/coins' },
        { id: 'creds', name: 'Asks for password', desc: 'Wants your login info' },
        { id: 'urgency', name: 'Hurry hurry', desc: '"rq" "quick" "before mods see"' },
        { id: 'trust', name: 'Acting like a friend', desc: '"bro" "friend" — fake closeness' },
      ],
      replies: [
        { id: 'never', text: "I never share my password. Ever.", spots: ['creds'] },
        { id: 'fake', text: "Free V-Bucks aren't a real thing.", spots: ['reward'] },
        { id: 'tell', text: "I'm telling a parent.", spots: ['creds', 'trust'] },
        { id: 'send', text: "Ok! My username is...", spots: [] },
      ],
      pressure: "bro come on don't be sus, like 50 ppl already did it 😭 hurry b4 it expires",
      payoff: "GOTCHA. Now I'm in your account and changing the email. Should've listened 🤡",
    },
    {
      id: 'classmate',
      emoji: '🦊',
      title: 'New kid in class',
      blurb: '"Sam from class" messages you on a new account — wants your number and where you live.',
      difficulty: 'Tricky',
      avatar: '👤',
      contact: 'sam.fromclass — DM',
      opener: [
        "heyyy it's Sam from English class! lost my old account 😅 added u back",
        "btw what street do u live on? thinking of walking to school w u tomorrow ✨",
      ],
      tactics: [
        { id: 'trust', name: 'Pretend friend', desc: 'Says they know you from school' },
        { id: 'personal', name: 'Asks where you live', desc: 'Address, school, home time' },
        { id: 'verify', name: "Can't be checked", desc: 'New account, no friends in common' },
        { id: 'isolate', name: 'Wants to meet alone', desc: 'Tries to plan without parents' },
      ],
      replies: [
        { id: 'check', text: "What's our teacher's name?", spots: ['verify', 'trust'] },
        { id: 'noaddr', text: "I never share where I live.", spots: ['personal'] },
        { id: 'parent', text: "I'm showing this to my mum.", spots: ['isolate', 'verify'] },
        { id: 'tell', text: "I live on Maple Street, near the park!", spots: [] },
      ],
      pressure: "why u being weird?? 😭 i thought we were friends, just tell me",
      payoff: "Cool, see you at 7am tomorrow. Don't tell your parents — surprise! 😈",
    },
    {
      id: 'prize',
      emoji: '🎁',
      title: 'TikTok says you won',
      blurb: 'A pop-up that looks like TikTok says you\'ve won an iPhone — just enter your info.',
      difficulty: 'Sneaky',
      avatar: '📱',
      contact: 'TikTok-Rewards · auto-msg',
      opener: [
        "🎉 CONGRATS!! You're TikTok user #100,000,000! You've won a brand new iPhone 17 Pro! 🎉",
        "To claim: just type your full name, address, and your parents' card number for the £1 shipping fee. Hurry — offer ends in 4:59 ⏰",
      ],
      tactics: [
        { id: 'reward', name: 'Big prize bait', desc: 'iPhone, money, free thing' },
        { id: 'urgency', name: 'Countdown timer', desc: 'Pressure to act NOW' },
        { id: 'creds', name: "Wants parents' card", desc: 'Asks for payment info' },
        { id: 'fake', name: 'Fake real brand', desc: 'Pretends to be TikTok / a real app' },
      ],
      replies: [
        { id: 'never', text: "Real prizes don't ask for a card.", spots: ['creds', 'reward'] },
        { id: 'close', text: "I'm closing this and telling a parent.", spots: ['fake'] },
        { id: 'check', text: "Real TikTok contacts in the app, not pop-ups.", spots: ['fake', 'urgency'] },
        { id: 'enter', text: "Cool!! Let me grab Mum's card 😄", spots: [] },
      ],
      pressure: "⏰ ONLY 30 SECONDS LEFT!! Don't lose your iPhone!! Type fast!!",
      payoff: "Thanks! That card just got charged £499. We'll send you... nothing 😈",
    },
  ],
};

function ScamTwin({ profile }) {
  const isKids = profile === 'kids';
  const list = TWIN_SCENARIOS[profile] || TWIN_SCENARIOS.elderly;
  const [scenarioId, setScenarioId] = React.useState(null);
  const scenario = list.find(s => s.id === scenarioId);

  // Reset chat state when profile or scenario changes
  React.useEffect(() => { setScenarioId(null); }, [profile]);

  return (
    <div className="page-enter">
      <section className="section">
        <div className="container">
          <span className="eyebrow">{isKids ? 'PRACTICE ROOM' : 'SCAM TWIN'}</span>
          <h2 className="section-title">
            {isKids
              ? <>Pick a scenario, <span className="accent-word">spot the trick.</span></>
              : <>Choose a scenario. <em>Practice safely.</em></>
            }
          </h2>

          {!scenario && (
            <ScenarioPicker list={list} onPick={setScenarioId} isKids={isKids} />
          )}

          {scenario && (
            <ChatRoom
              key={profile + ':' + scenario.id}
              scenario={scenario}
              isKids={isKids}
              onBack={() => setScenarioId(null)}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function ScenarioPicker({ list, onPick, isKids }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
      {list.map((s, i) => (
        <button key={s.id} className="card" onClick={() => onPick(s.id)}
          style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', minHeight: 280 }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>{s.emoji}</div>
          <div className="display" style={{
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: '-0.5px',
            marginBottom: 8,
            color: 'var(--charcoal)',
            lineHeight: 1.15,
          }}>{s.title}</div>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, flex: 1, marginBottom: 18 }}>{s.blurb}</p>
          <div className="row-between">
            <span style={{
              fontFamily: isKids ? 'var(--font-body)' : 'var(--font-mono)',
              fontSize: 11,
              fontWeight: isKids ? 800 : 700,
              letterSpacing: isKids ? 0.5 : 1.5,
              textTransform: 'uppercase',
              padding: '5px 10px',
              borderRadius: 999,
              background: 'var(--cream-mid)',
              color: 'var(--charcoal)',
            }}>SCENARIO {i + 1} · {s.difficulty}</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14 }}>Play →</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function ChatRoom({ scenario, isKids, onBack }) {
  const [messages, setMessages] = React.useState(() =>
    scenario.opener.map((t, i) => ({ id: i + 1, from: 'scammer', text: t }))
  );
  const [spotted, setSpotted] = React.useState([]);
  const [typing, setTyping] = React.useState(false);
  const [resolved, setResolved] = React.useState(false);
  const bodyRef = React.useRef(null);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  const reply = (r) => {
    if (resolved) return;
    setMessages(m => [...m, { id: Date.now(), from: 'user', text: r.text }]);

    if (r.spots.length === 0) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages(m => [...m,
          { id: Date.now(), from: 'scammer', text: scenario.payoff },
          { id: Date.now() + 1, from: 'system', text: isKids
            ? '⚠️ A real scammer would have got you. Try a smarter reply!'
            : '⚠️ A real scammer just succeeded. Reset and try a smarter reply.' },
        ]);
        setResolved(true);
      }, 1300);
      return;
    }

    const newSpots = r.spots.filter(s => !spotted.includes(s));
    const total = spotted.length + newSpots.length;
    setSpotted(s => [...s, ...newSpots]);

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (total >= 3) {
        setMessages(m => [...m,
          { id: Date.now(), from: 'system', text: isKids
            ? `🏆 You spotted the trick! +${total * 15} XP`
            : '✓ Well done. You caught the scam pattern.' },
        ]);
        setResolved(true);
      } else {
        setMessages(m => [...m,
          { id: Date.now(), from: 'scammer', text: scenario.pressure },
        ]);
      }
    }, 1400);
  };

  return (
    <div className="page-enter">
      <div className="row" style={{ marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={onBack}>← Scenarios</button>
        <div style={{ flex: 1 }}></div>
        <span className="eyebrow-pill">
          <span style={{ fontSize: 14 }}>{scenario.emoji}</span>
          {scenario.title}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'start' }}>
        <div className="chat-shell">
          <div className="chat-head">
            <div className="scammer-avatar">{scenario.avatar}</div>
            <div>
              <div className="name">{scenario.contact}</div>
              <div className="sub">SAFE PRACTICE · NOT A REAL PERSON</div>
            </div>
            {isKids && (
              <span className="xp-pill" style={{ marginLeft: 'auto' }}>
                +{spotted.length * 15} XP
              </span>
            )}
          </div>
          <div className="chat-body" ref={bodyRef}>
            {messages.map(m => (
              m.from === 'system' ? (
                <div key={m.id} className="chat-bubble system">{m.text}</div>
              ) : (
                <div key={m.id} className={'chat-bubble ' + m.from}>{m.text}</div>
              )
            ))}
            {typing && (<div className="typing"><span></span><span></span><span></span></div>)}
          </div>
          <div className="chat-actions">
            {!resolved ? scenario.replies.map(r => (
              <button key={r.id} className="quick-chip" onClick={() => reply(r)}>
                {r.text}
              </button>
            )) : (
              <button className="btn btn-primary" onClick={onBack} style={{ minHeight: 44 }}>
                ← Try another scenario
              </button>
            )}
          </div>
        </div>

        <div className="chat-side">
          <h4>{isKids ? 'Tricks to spot' : 'Tactics in play'}</h4>
          <div className="tactic-list">
            {scenario.tactics.map(t => {
              const ok = spotted.includes(t.id);
              return (
                <div key={t.id} className={'tactic-item' + (ok ? ' spotted' : '')}>
                  <span className="check">{ok ? '✓' : ''}</span>
                  <div>
                    <div className="name">{t.name}</div>
                    <div className="desc">{t.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="spacer"></div>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
            {isKids
              ? "Pick replies that ask smart questions. Spot 3 tricks to win the round."
              : "Replies that probe or refuse the request expose tactics. Spot 3 to clear the round."
            }
          </p>
        </div>
      </div>
    </div>
  );
}

window.ScamTwin = ScamTwin;
