import { useState, useEffect, useRef } from 'react';
import { generateScenarios, scamTwinTurn } from '../utils/api';

const DIFFICULTY_CONFIG = {
  elderly: [
    {
      id: 'gentle',
      label: 'Common',
      emoji: '🟢',
      desc: 'Clear red flags. Good starting point.',
      turns: 4,
      tagColour: 'var(--safe)',
    },
    {
      id: 'realistic',
      label: 'Realistic',
      emoji: '🟡',
      desc: 'Sounds plausible. Tactics are subtler.',
      turns: 6,
      tagColour: 'var(--amber)',
    },
    {
      id: 'expert',
      label: 'Expert',
      emoji: '🔴',
      desc: 'Near-indistinguishable from real. All tactics hidden.',
      turns: 8,
      tagColour: 'var(--danger)',
    },
  ],
  kids: [
    {
      id: 'gentle',
      label: 'Spotter',
      emoji: '🟢',
      desc: 'The trick is pretty obvious. Good first try!',
      turns: 4,
      tagColour: 'var(--safe)',
    },
    {
      id: 'realistic',
      label: 'Trickster',
      emoji: '🟡',
      desc: 'Sounds like a real message. Stay sharp!',
      turns: 6,
      tagColour: 'var(--amber)',
    },
    {
      id: 'expert',
      label: 'Mastermind',
      emoji: '🔴',
      desc: 'Really convincing. This one is tough.',
      turns: 8,
      tagColour: 'var(--danger)',
    },
  ],
};

// ─── Fallback scenarios (used if API is offline) ───────────────────────────
const FALLBACK_SCENARIOS = {
  elderly: [
    {
      id: 'fallback_bank', type: 'bank_fraud', emoji: '🏦',
      title: 'Barclays "Fraud Team"',
      blurb: 'A caller claims to be from your bank about suspicious activity.',
      difficulty: 'Aggressive', avatar: '🏦',
      contact: '"Barclays Fraud" — 0345 7345…',
      opener: [
        "Good afternoon. This is Andrew from the Barclays Fraud Team. We've spotted a payment of £540 leaving your account — was this you?",
        "For your safety I need to move your funds to a secure holding account. Could you confirm your card number and security code?"
      ],
      tactics: [
        { id: 'authority', name: 'Authority impersonation', desc: 'Claims to be your bank' },
        { id: 'fear', name: 'Fear & alarm', desc: 'Sudden alleged fraud — panic response' },
        { id: 'creds', name: 'Asks for credentials', desc: 'Card number, security code' },
        { id: 'safe_account', name: '"Safe account" fraud', desc: 'Move money "for safety"' },
      ],
    },
    {
      id: 'fallback_family', type: 'family', emoji: '👩‍👦',
      title: 'The "new number" text',
      blurb: 'Someone claims to be a family member on a new phone, needing money.',
      difficulty: 'Common', avatar: '👤',
      contact: '"Mum" — +44 7700 900xxx',
      opener: [
        "Hi love, it's Mum. Lost my phone, this is my new number — save it?",
        "Actually while I have you — I'm in a spot of bother. Could you transfer £250? I'll explain later xx"
      ],
      tactics: [
        { id: 'authority', name: 'Family impersonation', desc: 'Claims to be a relative' },
        { id: 'urgency', name: 'Manufactured urgency', desc: 'Pressure to act quickly' },
        { id: 'money', name: 'Money request', desc: 'Specific sum, immediate transfer' },
        { id: 'channel', name: 'Unverified channel', desc: 'Unknown new number' },
      ],
    },
    {
      id: 'fallback_hmrc', type: 'hmrc', emoji: '📮',
      title: 'HMRC Tax Refund',
      blurb: 'An email claiming you are owed a tax refund — just confirm your details.',
      difficulty: 'Subtle', avatar: '📨',
      contact: '"HMRC Refunds" — refunds@hmrc-uk.co',
      opener: [
        "Dear taxpayer, our records show you are entitled to a tax refund of £284.50 for 2023/24.",
        "To process your refund, kindly confirm your name, date of birth and bank details within 24 hours."
      ],
      tactics: [
        { id: 'authority', name: 'Government impersonation', desc: 'Pretends to be HMRC' },
        { id: 'reward', name: 'Refund bait', desc: 'Promises money to lure you' },
        { id: 'creds', name: 'Asks for personal info', desc: 'DOB and bank details' },
        { id: 'urgency', name: 'Time pressure', desc: '"Within 24 hours"' },
      ],
    },
  ],
  kids: [
    {
      id: 'fallback_gamer', type: 'gaming', emoji: '🎮',
      title: 'Free V-Bucks!',
      blurb: 'A stranger says they can get you free in-game currency — just share your login.',
      difficulty: 'Beginner', avatar: '🕹️',
      contact: 'XxFreeBucks_King · DM',
      opener: [
        "yo bro!! 🎮 I have EXTRA 13,500 V-Bucks I literally can't use. Want them free??",
        "just give me ur Epic username + password rq, I log in, drop the bucks, log out 👍 takes 30 secs"
      ],
      tactics: [
        { id: 'reward', name: 'Free stuff bait', desc: 'Promises free currency' },
        { id: 'creds', name: 'Asks for password', desc: 'Wants your login info' },
        { id: 'urgency', name: 'Hurry hurry', desc: '"Quick" "before it expires"' },
        { id: 'trust', name: 'Fake friendship', desc: '"bro" — pretend closeness' },
      ],
    },
    {
      id: 'fallback_friend', type: 'fake_friend', emoji: '🦊',
      title: 'New kid in class',
      blurb: '"Sam from school" messages on a new account — wants your address.',
      difficulty: 'Tricky', avatar: '👤',
      contact: 'sam.fromclass · DM',
      opener: [
        "heyyy it's Sam from English class! lost my old account 😅 added u back",
        "btw what street do u live on? thinking of walking to school w u tomorrow ✨"
      ],
      tactics: [
        { id: 'trust', name: 'Pretend friend', desc: 'Says they know you from school' },
        { id: 'personal', name: 'Asks where you live', desc: 'Wants your address' },
        { id: 'verify', name: "Can't be checked", desc: 'New account, no mutual friends' },
        { id: 'isolate', name: 'Wants to meet alone', desc: 'Plans without your parents' },
      ],
    },
    {
      id: 'fallback_prize', type: 'prize', emoji: '🎁',
      title: 'You won an iPhone!',
      blurb: 'A popup says you won a prize — just enter your parents\' card for "shipping".',
      difficulty: 'Sneaky', avatar: '📱',
      contact: 'TikTok-Rewards · auto-msg',
      opener: [
        "🎉 CONGRATS!! You're our 1,000,000th visitor! You've won a brand new iPhone! 🎉",
        "To claim: enter your name, address and a £1 shipping fee with your parents' card. Hurry — offer ends in 4:59 ⏰"
      ],
      tactics: [
        { id: 'reward', name: 'Big prize bait', desc: 'iPhone/money you never win' },
        { id: 'urgency', name: 'Countdown timer', desc: 'Pressure to act NOW' },
        { id: 'creds', name: "Wants parents' card", desc: 'Asks for payment info' },
        { id: 'fake', name: 'Fake real brand', desc: 'Pretends to be TikTok/Apple' },
      ],
    },
  ],
};

// ─── ScamTwin root component ───────────────────────────────────────────────
export default function ScamTwin({ profile, onNav }) {
  const isKids = profile === 'kids';
  const [scenarios, setScenarios] = useState(null);        // null = loading
  const [loadError, setLoadError] = useState(false);
  const [playedTypes, setPlayedTypes] = useState([]);       // track for exclusion
  const [activeScenario, setActiveScenario] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [difficulty, setDifficulty] = useState('realistic');

  // Generate scenarios on mount and when profile changes
  useEffect(() => {
    setActiveScenario(null);
    loadScenarios([]);
  }, [profile]);

  useEffect(() => {
    if (!activeScenario) loadScenarios([]);
  }, [difficulty]);

  const loadScenarios = async (excludeTypes) => {
    setScenarios(null);
    setLoadError(false);
    try {
      const data = await generateScenarios(profile, difficulty, excludeTypes);
      setScenarios(data.scenarios);
    } catch (err) {
      console.warn('Using fallback scenarios:', err);
      setScenarios(FALLBACK_SCENARIOS[profile] || FALLBACK_SCENARIOS.elderly);
      setLoadError(true);
    }
  };

  const handlePick = (scenario) => {
    setActiveScenario(scenario);
    setPlayedTypes(prev => [...new Set([...prev, scenario.type])]);
  };

  const handleBack = () => {
    setActiveScenario(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadScenarios(playedTypes);
    setRefreshing(false);
  };

  return (
    <div className="page-enter">
      <section className="section">
        <div className="container">
          <span className="eyebrow">{isKids ? 'PRACTICE ROOM' : 'SCAM TWIN'}</span>
          <h2 className="section-title">
            {isKids
              ? <><span className="accent-word">Spot the trick.</span> New scenario every time.</>
              : <>Choose a scenario. <em>Every session is different.</em></>}
          </h2>

          {!activeScenario && (
            <>
              <DifficultySelector
                profile={profile}
                value={difficulty}
                onChange={(d) => { setDifficulty(d); }}
                isKids={isKids}
              />
              <ScenarioPicker
                scenarios={scenarios}
                isKids={isKids}
                loadError={loadError}
                refreshing={refreshing}
                onPick={handlePick}
                onRefresh={handleRefresh}
              />
            </>
          )}

          {activeScenario && (
            <ChatRoom
              key={activeScenario.id + difficulty}
              scenario={activeScenario}
              isKids={isKids}
              profile={profile}
              difficulty={difficulty}
              onBack={handleBack}
              onNav={onNav}
            />
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Difficulty Selector ───────────────────────────────────────────────────
function DifficultySelector({ profile, value, onChange, isKids }) {
  const options = DIFFICULTY_CONFIG[profile] || DIFFICULTY_CONFIG.elderly;
  return (
    <div className="difficulty-selector">
      <div className="difficulty-label">
        {isKids ? 'PICK YOUR CHALLENGE' : 'DIFFICULTY'}
      </div>
      <div className="difficulty-options">
        {options.map(opt => (
          <button
            key={opt.id}
            className={`difficulty-btn${value === opt.id ? ' active' : ''}`}
            onClick={() => onChange(opt.id)}
            style={{ '--diff-colour': opt.tagColour }}
          >
            <span className="difficulty-btn-emoji">{opt.emoji}</span>
            <span className="difficulty-btn-label">{opt.label}</span>
            <span className="difficulty-btn-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Scenario Picker ───────────────────────────────────────────────────────
function ScenarioPicker({ scenarios, isKids, loadError, refreshing, onPick, onRefresh }) {
  // Loading state
  if (!scenarios) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{
            minHeight: 280, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <div style={{ fontSize: 40 }}>⏳</div>
            <div className="muted" style={{ fontSize: 13, textAlign: 'center' }}>
              {isKids ? 'Cooking up a fresh trick…' : 'Generating new scenario…'}
            </div>
            <div style={{
              height: 4, width: 120, background: 'var(--cream-dark)',
              borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: '60%',
                background: 'var(--accent)',
                animation: 'shimmer 1.2s ease-in-out infinite',
              }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Offline banner */}
      {loadError && (
        <div style={{
          background: 'rgba(255,183,3,0.1)', border: '1px solid var(--amber)',
          borderRadius: 12, padding: '10px 16px', marginBottom: 20,
          fontSize: 13, color: 'var(--charcoal)', display: 'flex',
          alignItems: 'center', gap: 10,
        }}>
          <span>⚠️</span>
          <span>Using saved scenarios — connect the backend for fresh AI-generated ones.</span>
        </div>
      )}

      {/* Scenario cards grid */}
      <div className="scenario-picker-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            className="card"
            onClick={() => onPick(s)}
            style={{
              textAlign: 'left', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', minHeight: 280,
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 14 }}>{s.emoji}</div>
            <div className="display" style={{
              fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px',
              marginBottom: 8, lineHeight: 1.15,
            }}>
              {s.title}
            </div>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, flex: 1, marginBottom: 16 }}>
              {s.blurb}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: isKids ? 'var(--font-body)' : 'var(--font-mono)',
                fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                textTransform: 'uppercase', padding: '4px 10px',
                borderRadius: 999, background: 'var(--cream-mid)',
                color: 'var(--charcoal)',
              }}>
                {s.difficulty}
              </span>
              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14 }}>
                Play →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Refresh button */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={refreshing}
          style={{ fontSize: 13 }}
        >
          {refreshing
            ? (isKids ? '⏳ Getting new scenarios…' : '⏳ Generating…')
            : (isKids ? '🎲 Give me different scenarios' : '🔄 Generate fresh scenarios')}
        </button>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          {isKids
            ? 'Every time you play, the tricks are different!'
            : 'Scenarios are AI-generated fresh each session'}
        </p>
      </div>
    </div>
  );
}

// ─── Chat Room ─────────────────────────────────────────────────────────────
function ChatRoom({ scenario, isKids, profile, difficulty, onBack, onNav }) {
  const [messages, setMessages] = useState(() =>
    scenario.opener.map((t, i) => ({ id: i + 1, role: 'scammer', text: t }))
  );
  const [spotted, setSpotted] = useState([]);
  const [suggestions, setSuggestions] = useState([
    isKids ? "Who are you really? 🤔" : "Can I call you back on the official number?",
    isKids ? "I never share my password" : "I won't give personal details over the phone",
    isKids ? "This sounds fake" : "Let me check this myself first",
    isKids ? "Yeah sure! 😊" : "Okay, what do you need from me?",
  ]);
  const [typing, setTyping] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [win, setWin] = useState(false);
  const [debrief, setDebrief] = useState(null);
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [history, setHistory] = useState([]); // for API
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  const sendMessage = async (text) => {
    if (resolved || typing || !text.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages(m => [...m, userMsg]);
    setCustomInput('');
    setShowCustom(false);
    setTyping(true);

    const updatedHistory = [...history, { role: 'user', text }];

    try {
      const data = await scamTwinTurn(scenario, history, text, profile, difficulty);

      setTyping(false);

      // Update spotted tactics
      if (data.spotted_tactic_ids?.length > 0) {
        setSpotted(prev => [...new Set([...prev, ...data.spotted_tactic_ids])]);
      }

      // Add scammer reply or game-over system message
      const replyMsg = {
        id: Date.now() + 1,
        role: data.game_over ? 'system' : 'scammer',
        text: data.scammer_reply,
      };
      setMessages(m => [...m, replyMsg]);

      // Update history for next turn
      setHistory([...updatedHistory, { role: 'scammer', text: data.scammer_reply }]);

      // Update suggestions for next turn
      if (data.suggested_replies?.length > 0 && !data.game_over) {
        setSuggestions(data.suggested_replies);
      }

      if (data.game_over) {
        setResolved(true);
        setWin(data.win);
        if (data.debrief) setDebrief(data.debrief);
      }

    } catch (err) {
      setTyping(false);
      // Fallback: simple pressure response
      const fallbackReply = isKids
        ? "come on!! just do it already 😤"
        : "I understand your hesitation, but every second counts here. Your money is at risk.";
      setMessages(m => [...m, { id: Date.now() + 1, role: 'scammer', text: fallbackReply }]);
      setHistory([...updatedHistory, { role: 'scammer', text: fallbackReply }]);
    }
  };

  return (
    <div className="page-enter">
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 18, flexWrap: 'wrap',
      }}>
        <button className="btn btn-secondary" onClick={onBack}>← Scenarios</button>
        <div style={{ flex: 1 }} />
        <span className="eyebrow-pill">
          <span style={{ fontSize: 14 }}>{scenario.emoji}</span>
          {scenario.title}
        </span>
        {(() => {
          const diffConf = (DIFFICULTY_CONFIG[profile] || DIFFICULTY_CONFIG.elderly)
            .find(d => d.id === difficulty);
          return diffConf ? (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 999,
              background: diffConf.tagColour + '18',
              color: diffConf.tagColour, border: `1px solid ${diffConf.tagColour}40`,
            }}>
              {diffConf.emoji} {diffConf.label}
            </span>
          ) : null;
        })()}
        {isKids && (
          <span className="xp-pill">+{spotted.length * 15} XP</span>
        )}
      </div>

      {/* Main grid */}
      <div className="chatroom-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: 32, alignItems: 'start',
      }}>

        {/* Left: Chat */}
        <div className="chat-shell">
          <div className="chat-head">
            <div className="scammer-avatar">{scenario.avatar}</div>
            <div>
              <div className="name">{scenario.contact}</div>
              <div className="sub">SAFE PRACTICE · AI-GENERATED · NOT A REAL PERSON</div>
            </div>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map(m => (
              m.role === 'system'
                ? <div key={m.id} className="chat-bubble system">{m.text}</div>
                : <div key={m.id} className={`chat-bubble ${m.role}`}>{m.text}</div>
            ))}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="typing"><span /><span /><span /></div>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                  {isKids ? 'typing...' : 'Scammer is typing…'}
                </span>
              </div>
            )}
          </div>

          {/* Action area */}
          <div className="chat-actions">
            {!resolved ? (
              <>
                {/* AI-generated suggestion chips */}
                {!showCustom && suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="quick-chip"
                    onClick={() => sendMessage(s)}
                    style={{
                      // Last chip is the "bad" option — style differently
                      ...(i === suggestions.length - 1 ? {
                        opacity: 0.6,
                        borderStyle: 'dashed',
                      } : {})
                    }}
                  >
                    {s}
                  </button>
                ))}

                {/* Custom input toggle */}
                {showCustom ? (
                  <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                    <input
                      autoFocus
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage(customInput)}
                      placeholder={isKids ? "Type your own reply…" : "Type your own response…"}
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 12,
                        border: '1.5px solid var(--cream-dark)',
                        fontFamily: 'var(--font-body)', fontSize: 14,
                        background: 'var(--cream)', outline: 'none',
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => sendMessage(customInput)}
                      disabled={!customInput.trim()}
                      style={{ padding: '10px 16px', minHeight: 'unset' }}
                    >
                      Send
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowCustom(false)}
                      style={{ padding: '10px 14px', minHeight: 'unset' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    className="quick-chip"
                    onClick={() => setShowCustom(true)}
                    style={{
                      border: '1.5px dashed var(--cream-dark)',
                      color: 'var(--muted)', fontSize: 12,
                    }}
                  >
                    ✏️ {isKids ? 'Type my own reply' : 'Type a custom response'}
                  </button>
                )}
              </>
            ) : (
              <div style={{
                display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%',
              }}>
                <button className="btn btn-primary" onClick={onBack}>
                  ← Try another scenario
                </button>
                {onNav && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => onNav('dna')}
                  >
                    🧬 Get my Scam DNA
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Tactics + Debrief */}
        <div>
          {/* Tactic tracker */}
          <div className="chat-side">
            <h4>{isKids ? 'Tricks to spot' : 'Tactics in play'}</h4>
            <div className="tactic-list">
              {(() => {
                const tacticCount = scenario.tactics?.length || 4;
                const hiddenCount = difficulty === 'expert'
                  ? tacticCount                      // all hidden in expert
                  : difficulty === 'realistic'
                    ? Math.min(1, tacticCount - 2)   // 1 hidden in realistic
                    : 0;                             // none hidden in gentle

                return scenario.tactics.map((t, i) => {
                  const ok = spotted.includes(t.id);
                  const isHidden = !ok && i >= (tacticCount - hiddenCount);
                  return (
                    <div key={t.id} className={`tactic-item${ok ? ' spotted' : ''}${isHidden ? ' hidden-tactic' : ''}`}>
                      <span className="check">{ok ? '✓' : isHidden ? '🔒' : ''}</span>
                      <div>
                        <div className="name">{isHidden ? '???' : t.name}</div>
                        <div className="desc">{isHidden ? 'Spot this tactic to reveal it' : t.desc}</div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            <p className="muted" style={{ fontSize: 12, marginTop: 14, lineHeight: 1.6 }}>
              {isKids
                ? 'Pick replies that ask smart questions. Spot 3 tricks to win!'
                : 'Responses that probe or refuse expose tactics. Claude judges in real time.'}
            </p>
          </div>

          {/* Debrief card — shown after game ends */}
          {resolved && (
            <div className="card page-enter" style={{
              marginTop: 16,
              borderLeft: `4px solid ${win ? 'var(--safe)' : 'var(--danger)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 36 }}>
                  {spotted.length >= 3 ? '🏆' : spotted.length >= 2 ? '🛡️' : '⚠️'}
                </span>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 18,
                    fontWeight: 900, letterSpacing: '-0.3px',
                  }}>
                    {win
                      ? (isKids ? 'You spotted the trick!' : 'Scam pattern identified')
                      : (isKids ? 'The trick got you this time' : 'The scammer succeeded')}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    letterSpacing: 1, color: 'var(--muted)',
                    textTransform: 'uppercase', marginTop: 3,
                  }}>
                    {spotted.length} / {scenario.tactics.length} tactics spotted
                  </div>
                </div>
              </div>

              {/* AI debrief text */}
              {debrief && (
                <div style={{
                  background: 'var(--cream)', borderRadius: 10,
                  padding: '12px 14px', fontSize: 13, lineHeight: 1.7,
                  color: 'var(--charcoal)', fontStyle: 'italic',
                  borderLeft: '3px solid var(--accent)', marginBottom: 14,
                }}>
                  {debrief}
                </div>
              )}

              {/* Tactic breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {scenario.tactics.map(t => {
                  const ok = spotted.includes(t.id);
                  return (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '9px 12px', borderRadius: 10, fontSize: 12,
                      background: ok ? 'rgba(76,175,130,0.08)' : 'rgba(230,57,70,0.06)',
                    }}>
                      <span style={{
                        fontWeight: 900, fontSize: 13, flexShrink: 0,
                        color: ok ? 'var(--safe)' : 'var(--danger)',
                      }}>
                        {ok ? '✓' : '✗'}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        <div style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
