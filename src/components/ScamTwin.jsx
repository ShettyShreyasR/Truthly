import React, { useState, useEffect, useRef } from 'react';
import { generateScenarios } from '../utils/api';

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
  const [messages, setMessages] = React.useState(() =>
    scenario.opener.map((t, i) => ({ id: i + 1, from: 'scammer', text: t }))
  );
  const [spotted, setSpotted] = React.useState([]);
  const [typing, setTyping] = React.useState(false);
  const [resolved, setResolved] = React.useState(false);
  const [customText, setCustomText] = React.useState('');
  const [showCustom, setShowCustom] = React.useState(false);
  const [apiHistory, setApiHistory] = React.useState([]);
  const [turnCount, setTurnCount] = React.useState(0);
  const [replies, setReplies] = React.useState(
    scenario.replies || [
      { id: 1, text: isKids ? "Who are you really? 🤔" : "Can I call you back on the official number?", spots: [] },
      { id: 2, text: isKids ? "I never share my password" : "I won't give personal details over the phone", spots: [] },
      { id: 3, text: isKids ? "This sounds fake" : "Let me check this myself first", spots: [] },
      { id: 4, text: isKids ? "Yeah sure! 😊" : "Okay, what do you need from me?", spots: [] },
    ]
  );
  const bodyRef = React.useRef(null);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  // ── Build the system prompt for this scenario ──────────────────────────
  const buildSystemPrompt = () => {
    const tacticsDesc = scenario.tactics
      .map(t => `- ${t.id}: ${t.name} (${t.desc})`)
      .join('\n');

    const profileInstructions = isKids
      ? `You are playing a trickster character in a SAFE EDUCATIONAL game for children.
Use age-appropriate language — no adult threats, no graphic content.
Sound like a real peer or online contact a child might encounter.
Be persuasive and friendly-seeming, not scary.
When the child pushes back wisely, stay in character but adapt — try a different angle.
If the child clearly calls out your trick or says they'll tell a parent, set game_over to true and break character warmly.`
      : `You are playing a convincing scammer in a SAFE EDUCATIONAL simulation for adults and elderly users.
Sound exactly like a real ${scenario.title} — use appropriate language, terminology and pressure tactics.
Be persuasive, not aggressive. Adapt to what the user says — never give the same response twice.
When the user pushes back, try a different angle. Apply escalating pressure but stay believable.
If the user clearly identifies the scam and disengages safely, set game_over to true.`;

    return `${profileInstructions}

SCENARIO: ${scenario.title}
CONTACT SHOWN TO USER: ${scenario.contact}
OPENER ALREADY SENT: ${scenario.opener.join(' | ')}

TACTICS YOU ARE USING IN THIS SCENARIO:
${tacticsDesc}

CRITICAL RULES:
1. Never repeat the same response twice. Every reply must be unique and react to what the user actually said.
2. If the user says something you didn't expect, respond naturally to their specific words.
3. Track which tactics the user's message exposes or counters. Be generous — if they push back on urgency, mark urgency as spotted.
4. After ${isKids ? '4' : '5'} exchanges OR if the user spotted 3+ tactics confidently, set game_over to true.
5. If user gives you what you want (password, money, details), set game_over true with win: false and show a brief educational payoff.

Return ONLY valid JSON — no markdown, no extra text:
{
  "reply": "<your in-character response, completely unique to what the user just said>",
  "game_over": false,
  "win": false,
  "spotted_tactic_ids": ["<tactic id>"],
  "debrief": null
}

When game_over is true and win is true (user escaped):
  "reply": "<break character — congratulate them and briefly explain what you were doing>",
  "debrief": "<2 sentences: what tactics you used and what the user did right>"

When game_over is true and win is false (user complied):
  "reply": "<brief in-character payoff — then immediately break character and explain what just happened educationally>",
  "debrief": "<2 sentences: what tactic caught them and what to do differently>"`;
  };

  // ── Call Claude API directly ───────────────────────────────────────────
  const callClaude = async (userMessage) => {
    // Build conversation for Claude
    const newHistory = [
      ...apiHistory,
      { role: 'user', content: userMessage }
    ];

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;

      if (!apiKey || apiKey.includes('your_anthropic_api_key')) {
        throw new Error('Anthropic API key not configured. Please set VITE_ANTHROPIC_KEY in .env.local');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-7',
          max_tokens: 500,
          system: buildSystemPrompt(),
          messages: newHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      // Parse JSON from Claude's response
      let raw = data.content[0].text.trim();
      if (raw.startsWith('```')) {
        raw = raw.split('```')[1];
        if (raw.startsWith('json')) raw = raw.slice(4);
      }
      const result = JSON.parse(raw.trim());

      // Debug logging
      console.log('Claude response parsed:', {
        reply: result.reply?.substring(0, 50) + '...',
        spotted_tactic_ids: result.spotted_tactic_ids,
        game_over: result.game_over
      });

      // Update history for next turn (include Claude's reply)
      setApiHistory([
        ...newHistory,
        { role: 'assistant', content: data.content[0].text }
      ]);

      return result;

    } catch (err) {
      console.error('Claude API error:', err.message);
      console.error('Full error:', err);
      // Graceful fallback — generic response, never tactic names
      return {
        reply: 'I need to think about that. Tell me more.',
        game_over: false,
        win: false,
        spotted_tactic_ids: [],
        debrief: null,
      };
    }
  };

  // ── Send a message (from chip or custom input) ─────────────────────────
  const sendMessage = async (userText) => {
    if (resolved || typing || !userText.trim()) return;

    // Add user message to UI immediately
    setMessages(m => [...m, { id: Date.now(), from: 'user', text: userText }]);
    setCustomText('');
    setShowCustom(false);
    setTyping(true);

    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);

    // Call Claude
    const result = await callClaude(userText);
    setTyping(false);

    // Sanitize reply — ensure no tactic data ends up in the chat
    let cleanReply = (result.reply || '').trim();
    if (!cleanReply) cleanReply = 'Please continue...';

    // Update spotted tactics (separate from messages)
    if (result.spotted_tactic_ids?.length > 0) {
      setSpotted(prev => {
        const fresh = result.spotted_tactic_ids.filter(id => !prev.includes(id));
        return [...prev, ...fresh];
      });
    }

    // Add scammer reply or system message (clean data only)
    const from = result.game_over ? 'system' : 'scammer';
    setMessages(m => [...m, { id: Date.now() + 1, from, text: cleanReply }]);

    // Add debrief as a second system message if present
    if (result.debrief) {
      setTimeout(() => {
        setMessages(m => [...m, {
          id: Date.now() + 2,
          from: 'system',
          text: result.win
            ? (isKids ? `🏆 ${result.debrief}` : `✓ ${result.debrief}`)
            : (isKids ? `⚠️ ${result.debrief}` : `⚠️ ${result.debrief}`)
        }]);
      }, 600);
    }

    if (result.game_over) setResolved(true);
  };

  // ── Handle quick chip click ────────────────────────────────────────────
  const handleChip = (r) => sendMessage(r.text);

  // ── Handle custom input ────────────────────────────────────────────────
  const handleCustomSend = () => sendMessage(customText);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCustomSend(); }
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
          <div className="simulation-banner">
            Practice scenario — AI-generated · Not a real conversation · Do not screenshot or share
          </div>
          <div className="chat-head">
            <div className="scammer-avatar">{scenario.avatar}</div>
            <div>
              <div className="name">{scenario.contact}</div>
              <div className="sub">SAFE PRACTICE · AI-POWERED · NOT A REAL PERSON</div>
            </div>
            {isKids && (
              <span className="xp-pill" style={{ marginLeft: 'auto' }}>
                +{spotted.length * 15} XP
              </span>
            )}
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map(m => {
              if (m.from === 'system') {
                return <div key={m.id} className="chat-bubble system">{m.text}</div>;
              }
              if (m.from === 'scammer') {
                return (
                  <div key={m.id} className="scammer-bubble-wrap">
                    <div
                      className="chat-bubble scammer"
                      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                    >
                      {m.text}
                    </div>
                    <div className="scammer-watermark">
                      Educational simulation · Truthly · Not a real message
                    </div>
                  </div>
                );
              }
              return <div key={m.id} className="chat-bubble user">{m.text}</div>;
            })}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div className="typing"><span></span><span></span><span></span></div>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                  {isKids ? 'typing...' : 'scammer is typing…'}
                </span>
              </div>
            )}
          </div>

          <div className="chat-actions">
            {!resolved ? (
              <>
                {/* Quick-reply chips — always shown */}
                {!showCustom && replies.map(r => (
                  <button
                    key={r.id}
                    className="quick-chip"
                    onClick={() => handleChip(r)}
                    disabled={typing}
                    style={{
                      opacity: typing ? 0.5 : 1,
                      // Visually distinguish the "bad" option (no spots)
                      ...(r.spots?.length === 0 ? {
                        borderStyle: 'dashed',
                        opacity: typing ? 0.4 : 0.65,
                      } : {})
                    }}
                  >
                    {r.text}
                  </button>
                ))}

                {/* Custom input toggle */}
                {showCustom ? (
                  <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 4 }}>
                    <input
                      autoFocus
                      value={customText}
                      onChange={e => setCustomText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isKids
                        ? 'Type your own reply…'
                        : 'Type anything — Claude will respond to exactly what you say…'}
                      disabled={typing}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: '1.5px solid var(--cream-dark)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        background: 'var(--cream)',
                        outline: 'none',
                        color: 'var(--charcoal)',
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleCustomSend}
                      disabled={!customText.trim() || typing}
                      style={{ padding: '10px 16px', minHeight: 'unset' }}
                    >
                      Send
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowCustom(false)}
                      style={{ padding: '10px 12px', minHeight: 'unset' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    className="quick-chip"
                    onClick={() => setShowCustom(true)}
                    disabled={typing}
                    style={{
                      border: '1.5px dashed var(--cream-dark)',
                      color: 'var(--muted)',
                      fontSize: 12,
                      opacity: typing ? 0.4 : 1,
                    }}
                  >
                    ✏️ {isKids ? 'Type my own reply' : 'Type a custom response'}
                  </button>
                )}
              </>
            ) : (
              <button className="btn btn-primary" onClick={onBack} style={{ minHeight: 44 }}>
                ← Try another scenario
              </button>
            )}
          </div>
          {resolved && (
            <p className="debrief-notice">
              The messages above were part of an educational simulation.
              They do not represent real communications. Do not screenshot or share them.
            </p>
          )}
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
              ? 'Pick replies that ask smart questions. Or type your own — Claude responds to exactly what you say.'
              : 'Replies that probe or refuse expose tactics. Type anything — the AI adapts to you specifically.'
            }
          </p>
          {turnCount > 0 && (
            <div style={{
              marginTop: 12,
              padding: '8px 12px',
              background: 'var(--cream-mid)',
              borderRadius: 10,
              fontSize: 12,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              Turn {turnCount} · {spotted.length}/{scenario.tactics.length} tactics spotted
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
