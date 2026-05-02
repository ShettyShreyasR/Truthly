import { useState } from 'react';

// ─── VERIFIED UK HELPLINES (confirmed May 2026) ────────────────────────────
//
// IMPORTANT FOR FUTURE MAINTAINERS:
// All numbers below are verified official UK contacts.
// Review quarterly — helpline numbers occasionally change.
// Sources: reportfraud.police.uk, ageuk.org.uk, citizensadvice.org.uk,
//          ncsc.gov.uk, thesilverline.org.uk, victimsupport.org.uk
//
// ──────────────────────────────────────────────────────────────────────────

const UK_HELPLINES = {

  // ── UNIVERSAL (all UK nations) ─────────────────────────────────────────
  universal: [
    {
      id: 'bank_159',
      emoji: '🏦',
      name: 'Your Bank — Fraud Line',
      number: '159',
      callLabel: 'Call 159',
      hours: '24/7 · Free from any UK phone',
      desc: 'Connects you directly to your bank\'s fraud team. Works with Barclays, HSBC, Lloyds, NatWest, Santander, Halifax, TSB and more. Use a different device if possible.',
      priority: 'HIGH',
      url: null,
      nations: ['england', 'scotland', 'wales', 'northern_ireland'],
    },
    {
      id: 'citizens_advice',
      emoji: '🤝',
      name: 'Citizens Advice',
      number: '0808 223 1133',
      callLabel: 'Call free',
      hours: 'Mon–Fri 9am–5pm · Free from mobiles & landlines',
      desc: 'Free, independent advice on scams. Can help you understand your rights and what to do next. Welsh speakers: 0808 223 1144.',
      priority: 'STANDARD',
      url: 'https://www.citizensadvice.org.uk',
      nations: ['england', 'scotland', 'wales', 'northern_ireland'],
    },
    {
      id: 'ncsc_email',
      emoji: '📧',
      name: 'Report Scam Emails',
      number: null,
      callLabel: 'Forward email',
      hours: 'Any time',
      desc: 'Forward suspicious emails to report@phishing.gov.uk — the National Cyber Security Centre will investigate and can take down scam websites.',
      priority: 'STANDARD',
      url: 'mailto:report@phishing.gov.uk',
      nations: ['england', 'scotland', 'wales', 'northern_ireland'],
    },
    {
      id: 'spam_texts',
      emoji: '💬',
      name: 'Report Scam Texts',
      number: '7726',
      callLabel: 'Text 7726',
      hours: 'Any time · Free',
      desc: 'Forward any scam text to 7726 (spells SPAM). Your mobile provider investigates and can block the number. No cost.',
      priority: 'STANDARD',
      url: null,
      nations: ['england', 'scotland', 'wales', 'northern_ireland'],
    },
    {
      id: 'victim_support',
      emoji: '💜',
      name: 'Victim Support',
      number: '0808 168 9111',
      callLabel: 'Call free',
      hours: '24/7 · Free · England & Wales',
      desc: 'Free, confidential emotional support for scam victims. Being scammed is traumatic — you don\'t have to deal with it alone.',
      priority: 'STANDARD',
      url: 'https://www.victimsupport.org.uk',
      nations: ['england', 'wales'],
    },
    {
      id: 'samaritans',
      emoji: '🫂',
      name: 'Samaritans',
      number: '116 123',
      callLabel: 'Call free',
      hours: '24/7 · Free · Always open',
      desc: 'If you\'re feeling distressed, overwhelmed or low after being scammed. No judgment. Just a calm voice.',
      priority: 'EMOTIONAL',
      url: 'https://www.samaritans.org',
      nations: ['england', 'scotland', 'wales', 'northern_ireland'],
    },
    {
      id: 'moneyhelper',
      emoji: '💰',
      name: 'MoneyHelper',
      number: '0800 011 3797',
      callLabel: 'Call free',
      hours: 'Mon–Fri 8am–6pm · Free',
      desc: 'Free guidance on recovering money after a scam. Backed by the government\'s Money and Pensions Service.',
      priority: 'STANDARD',
      url: 'https://www.moneyhelper.org.uk',
      nations: ['england', 'scotland', 'wales', 'northern_ireland'],
    },
  ],

  // ── BY NATION — Reporting authority differs per nation ─────────────────
  byNation: {
    england: [
      {
        id: 'report_fraud',
        emoji: '🚨',
        name: 'Report Fraud',
        number: '0300 123 2040',
        callLabel: 'Call now',
        hours: 'Online 24/7 · Phone Mon–Fri 8am–8pm',
        desc: 'The UK\'s national fraud reporting service for England (replaced Action Fraud in December 2025). You\'ll get a crime reference number. Report online any time at reportfraud.police.uk.',
        priority: 'HIGH',
        url: 'https://www.reportfraud.police.uk',
        isMainReporter: true,
      },
    ],
    wales: [
      {
        id: 'report_fraud_wales',
        emoji: '🚨',
        name: 'Report Fraud',
        number: '0300 123 2040',
        callLabel: 'Call now',
        hours: 'Online 24/7 · Phone Mon–Fri 8am–8pm',
        desc: 'The national fraud reporting service for Wales. Welsh-language service available. Report online at reportfraud.police.uk or call.',
        priority: 'HIGH',
        url: 'https://www.reportfraud.police.uk',
        isMainReporter: true,
      },
      {
        id: 'citizens_advice_wales',
        emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
        name: 'Citizens Advice Wales (Cymraeg)',
        number: '0808 223 1144',
        callLabel: 'Call free',
        hours: 'Mon–Fri 9am–5pm · Free',
        desc: 'Welsh-language advice line for scam victims in Wales. Cyngor ar Bopeth.',
        priority: 'STANDARD',
        url: 'https://www.citizensadvice.org.uk/wales/',
        isMainReporter: false,
      },
    ],
    scotland: [
      {
        id: 'police_scotland',
        emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        name: 'Police Scotland',
        number: '101',
        callLabel: 'Call 101',
        hours: '24/7 · Non-emergency',
        desc: 'In Scotland, report fraud directly to Police Scotland on 101. Do NOT use Report Fraud — it does not cover Scotland. For emergencies call 999.',
        priority: 'HIGH',
        url: 'https://www.scotland.police.uk',
        isMainReporter: true,
      },
      {
        id: 'advice_direct_scotland',
        emoji: '🤝',
        name: 'Advice Direct Scotland',
        number: '0808 164 6000',
        callLabel: 'Call free',
        hours: 'Mon–Fri 9am–5pm · Free',
        desc: 'Free specialist scam and consumer advice for people in Scotland. Scottish equivalent of Citizens Advice.',
        priority: 'STANDARD',
        url: 'https://www.advicedirect.scot',
        isMainReporter: false,
      },
    ],
    northern_ireland: [
      {
        id: 'report_fraud_ni',
        emoji: '🚨',
        name: 'Report Fraud',
        number: '0300 123 2040',
        callLabel: 'Call now',
        hours: 'Online 24/7 · Phone Mon–Fri 8am–8pm',
        desc: 'Report fraud in Northern Ireland via the national service. Also report to your local PSNI station for crimes that happened in person.',
        priority: 'HIGH',
        url: 'https://www.reportfraud.police.uk',
        isMainReporter: true,
      },
      {
        id: 'psni',
        emoji: '🚔',
        name: 'PSNI (Police NI)',
        number: '101',
        callLabel: 'Call 101',
        hours: '24/7 · Non-emergency',
        desc: 'Police Service of Northern Ireland — for in-person scams, doorstep fraud, or if you feel unsafe.',
        priority: 'STANDARD',
        url: 'https://www.psni.police.uk',
        isMainReporter: false,
      },
      {
        id: 'consumerline_ni',
        emoji: '📞',
        name: 'Consumerline NI',
        number: '0300 123 6262',
        callLabel: 'Call free',
        hours: 'Mon–Thu 9am–5pm, Fri 9am–4pm',
        desc: 'Northern Ireland\'s consumer advice service — helps with scam complaints and trading standards issues.',
        priority: 'STANDARD',
        url: 'https://www.economy-ni.gov.uk/topics/consumerline',
        isMainReporter: false,
      },
    ],
  },

  // ── SPECIALIST BY AUDIENCE ─────────────────────────────────────────────
  specialist: {
    elderly: [
      {
        id: 'age_uk',
        emoji: '🫖',
        name: 'Age UK Advice Line',
        number: '0800 678 1602',
        callLabel: 'Call free',
        hours: '8am–7pm · 365 days a year · Free',
        desc: 'Specialist advice for older people who\'ve been scammed or targeted. They know exactly what to do and will guide you through it.',
        priority: 'HIGH',
        url: 'https://www.ageuk.org.uk',
      },
      {
        id: 'silver_line',
        emoji: '🌙',
        name: 'The Silver Line',
        number: '0800 4 70 80 90',
        callLabel: 'Call free',
        hours: '24/7 · 365 days · Free · For over 55s',
        desc: 'Free confidential helpline for older people. Friendship, information and support any time of day or night. Run by Age UK.',
        priority: 'EMOTIONAL',
        url: 'https://www.thesilverline.org.uk',
      },
      {
        id: 'think_jessica',
        emoji: '💛',
        name: 'Think Jessica',
        number: null,
        callLabel: 'Visit website',
        hours: 'Online resource',
        desc: 'Emotional and practical support specifically for older scam victims. Named after a real victim — genuinely understands the shame and trauma.',
        priority: 'EMOTIONAL',
        url: 'https://www.thinkjessica.com',
      },
    ],
    kids: [
      {
        id: 'childline',
        emoji: '📞',
        name: 'Childline',
        number: '0800 1111',
        callLabel: 'Call free',
        hours: '24/7 · Free · Under 19s',
        desc: 'Free, confidential helpline for anyone under 19. If you\'re worried about something online or you\'ve given your details to someone you shouldn\'t have.',
        priority: 'HIGH',
        url: 'https://www.childline.org.uk',
      },
      {
        id: 'ceop',
        emoji: '🛡️',
        name: 'CEOP (Child Safety)',
        number: null,
        callLabel: 'Report online',
        hours: 'Online reports · 24/7',
        desc: 'If an adult has been asking you personal questions, wanting to meet, or made you uncomfortable online — report it to CEOP. They take it seriously.',
        priority: 'HIGH',
        url: 'https://www.ceop.police.uk/safety-centre/',
      },
      {
        id: 'young_minds',
        emoji: '💚',
        name: 'YoungMinds',
        number: '85258',
        callLabel: 'Text YM to 85258',
        hours: '24/7 · Free text service',
        desc: 'If you\'re feeling anxious, embarrassed or upset about what happened online. Text YM to 85258 for a free crisis text line.',
        priority: 'EMOTIONAL',
        url: 'https://www.youngminds.org.uk',
      },
    ],
  },
};

// ─── FIRST AID PROTOCOLS ───────────────────────────────────────────────────
// Immediate step-by-step guidance based on what just happened

const FIRST_AID = {
  // Still on the call / actively happening
  live_call: {
    id: 'live_call',
    emoji: '📞',
    label: 'I\'m on the phone with them right now',
    urgency: 'immediate',
    script: 'Say this now: "I need to call you back on the official number." Then hang up.',
    scriptNote: 'Real banks, HMRC and police NEVER mind you hanging up to verify. Scammers will pressure you to stay on. That pressure IS the red flag.',
    steps: [
      { icon: '📵', text: 'Hang up now — even mid-sentence is fine', done: false },
      { icon: '⏳', text: 'Wait 5 minutes before calling anyone — scammers can hold your line open', done: false },
      { icon: '📱', text: 'Use a different phone or mobile if possible', done: false },
      { icon: '🔢', text: 'Call 159 to reach your bank\'s real fraud team', done: false },
      { icon: '📋', text: 'Write down what they said — you\'ll need it for your report', done: false },
    ],
  },

  gave_bank_details: {
    id: 'gave_bank_details',
    emoji: '💳',
    label: 'I gave my bank details or card number',
    urgency: 'urgent',
    script: 'Call your bank immediately on 159 or the number on the back of your card. Ask them to freeze your account.',
    scriptNote: 'The next 30 minutes matter most. Many banks can recall payments if you act quickly.',
    steps: [
      { icon: '📞', text: 'Call 159 NOW — or the number on the back of your card', done: false },
      { icon: '🔒', text: 'Ask to freeze your account and cancel any affected cards', done: false },
      { icon: '📸', text: 'Screenshot every message and note the number/email that contacted you', done: false },
      { icon: '🔑', text: 'Change your online banking password from a secure device', done: false },
      { icon: '🚨', text: 'Report to Report Fraud: 0300 123 2040 (or Police Scotland: 101)', done: false },
      { icon: '👁️', text: 'Monitor your bank statements daily for the next 2 weeks', done: false },
    ],
  },

  sent_money: {
    id: 'sent_money',
    emoji: '💸',
    label: 'I transferred money to them',
    urgency: 'urgent',
    script: 'Call your bank on 159 right now. Say "I\'ve been the victim of a scam transfer — I need to request a recall."',
    scriptNote: 'Banks have a 24-hour recall window for some transfers. Every minute counts.',
    steps: [
      { icon: '📞', text: 'Call 159 immediately — ask to recall the payment', done: false },
      { icon: '📝', text: 'Note the account details they gave you (sort code & account number)', done: false },
      { icon: '📸', text: 'Screenshot all messages and evidence before anything is deleted', done: false },
      { icon: '🚨', text: 'Report to Report Fraud (England/Wales/NI): 0300 123 2040', done: false },
      { icon: '📄', text: 'Get a crime reference number — your bank needs this', done: false },
      { icon: '🏦', text: 'Ask your bank about the APP Fraud reimbursement scheme', done: false },
    ],
  },

  clicked_link: {
    id: 'clicked_link',
    emoji: '🔗',
    label: 'I clicked a suspicious link',
    urgency: 'moderate',
    script: 'Close the page immediately. Don\'t enter anything. You may be fine — but let\'s check.',
    scriptNote: 'Clicking alone is usually safe. It only becomes serious if you entered details or downloaded something.',
    steps: [
      { icon: '❌', text: 'Close the page or tab right now', done: false },
      { icon: '🔍', text: 'Did you type any details? If yes — treat this as a bank details incident', done: false },
      { icon: '💾', text: 'Did something download? Don\'t open it. Delete it immediately.', done: false },
      { icon: '🔄', text: 'Run a security scan on your device (Windows Security / Mac Malware Removal)', done: false },
      { icon: '🔑', text: 'Change passwords for any accounts you may have been logged into', done: false },
      { icon: '👁️', text: 'Check your bank statements over the next 7 days', done: false },
    ],
  },

  gave_password: {
    id: 'gave_password',
    emoji: '🔑',
    label: 'I gave my password or login details',
    urgency: 'urgent',
    script: 'Change your password right now on the account they asked about. Then check for any accounts using the same password.',
    scriptNote: 'Scammers often try the same password on multiple services — email, bank, social media.',
    steps: [
      { icon: '🔑', text: 'Change your password immediately on the affected account', done: false },
      { icon: '📧', text: 'Change your email password too — it\'s the master key to everything', done: false },
      { icon: '🔒', text: 'Turn on two-factor authentication (2FA) where possible', done: false },
      { icon: '🔍', text: 'Check if the account shows any logins you don\'t recognise', done: false },
      { icon: '📝', text: 'List any other accounts using the same password and change those too', done: false },
      { icon: '🚨', text: 'Report to Report Fraud: 0300 123 2040 if you believe a crime occurred', done: false },
    ],
  },

  received_suspicious: {
    id: 'received_suspicious',
    emoji: '📱',
    label: 'I got a suspicious message or call (didn\'t respond)',
    urgency: 'low',
    script: 'Good — you haven\'t been harmed. Help others by reporting it.',
    scriptNote: 'Every report helps build intelligence that protects other people.',
    steps: [
      { icon: '📵', text: 'Block the number or sender', done: false },
      { icon: '💬', text: 'Forward scam texts to 7726 (free)', done: false },
      { icon: '📧', text: 'Forward scam emails to report@phishing.gov.uk', done: false },
      { icon: '🚨', text: 'Report the number at reportfraud.police.uk (takes 5 minutes)', done: false },
      { icon: '👨‍👩‍👧', text: 'Tell friends and family — especially if targeting a specific group', done: false },
    ],
  },

  unsure: {
    id: 'unsure',
    emoji: '🤔',
    label: 'I\'m not sure what happened',
    urgency: 'low',
    script: 'Take a breath. You\'re in the right place. Let\'s figure it out together.',
    scriptNote: 'Not knowing exactly what happened is very common. Start with protecting your accounts.',
    steps: [
      { icon: '📸', text: 'Screenshot everything — messages, links, numbers — before you forget', done: false },
      { icon: '📝', text: 'Write down what happened in order, with times if you remember', done: false },
      { icon: '📞', text: 'Call Citizens Advice free on 0808 223 1133 — they\'ll guide you', done: false },
      { icon: '🔑', text: 'Change passwords on your main accounts as a precaution', done: false },
      { icon: '👁️', text: 'Keep an eye on bank statements for unusual activity', done: false },
    ],
  },

  // Kids-specific incidents
  kids_gave_password: {
    id: 'kids_gave_password',
    emoji: '🔑',
    label: 'I gave someone my password',
    urgency: 'urgent',
    script: 'Tell a parent or trusted adult right now. You haven\'t done anything wrong — the person who tricked you is the problem.',
    scriptNote: 'A grown-up can help you fix this quickly.',
    steps: [
      { icon: '👨‍👩‍👧', text: 'Tell a parent, guardian or trusted adult right now', done: false },
      { icon: '🔑', text: 'Change your password straight away (ask for help if needed)', done: false },
      { icon: '🔒', text: 'Check if they\'ve changed anything on your account', done: false },
      { icon: '📞', text: 'Call Childline on 0800 1111 if you\'re worried or upset', done: false },
      { icon: '📱', text: 'Tell the game or app support team what happened', done: false },
    ],
  },

  kids_shared_location: {
    id: 'kids_shared_location',
    emoji: '📍',
    label: 'Someone asked where I live / wants to meet me',
    urgency: 'immediate',
    script: 'Tell a trusted adult immediately. Do NOT meet this person. This is very important.',
    scriptNote: 'You haven\'t done anything wrong. Real friends from school already know where you live.',
    steps: [
      { icon: '👨‍👩‍👧', text: 'Tell a parent or trusted adult RIGHT NOW — this is urgent', done: false },
      { icon: '🚫', text: 'Do not reply to this person again', done: false },
      { icon: '🔒', text: 'Block them on every platform', done: false },
      { icon: '🛡️', text: 'Report to CEOP at ceop.police.uk — the police take this seriously', done: false },
      { icon: '📸', text: 'Screenshot the messages before blocking so adults can see', done: false },
    ],
  },

  kids_clicked_link: {
    id: 'kids_clicked_link',
    emoji: '🔗',
    label: 'I tapped a weird link',
    urgency: 'moderate',
    script: 'Close it straight away and tell a grown-up. You\'re probably fine!',
    scriptNote: 'Most of the time, just clicking is okay. Let an adult check the device to be sure.',
    steps: [
      { icon: '❌', text: 'Close the page or app right now', done: false },
      { icon: '👨‍👩‍👧', text: 'Tell a parent or trusted adult what happened', done: false },
      { icon: '🔍', text: 'Did you type your name, address or any details? Tell an adult if yes', done: false },
      { icon: '📱', text: 'Let a grown-up check your device', done: false },
      { icon: '📞', text: 'Call Childline on 0800 1111 if you\'re worried', done: false },
    ],
  },

  kids_unsure: {
    id: 'kids_unsure',
    emoji: '🤔',
    label: 'Something felt wrong but I\'m not sure',
    urgency: 'low',
    script: 'Trusting that feeling is really smart. Let\'s talk it through.',
    scriptNote: 'Your instincts are there to protect you. It\'s always okay to ask for help.',
    steps: [
      { icon: '👨‍👩‍👧', text: 'Tell a parent, guardian or teacher what felt weird', done: false },
      { icon: '📸', text: 'Screenshot the message so a grown-up can see it', done: false },
      { icon: '📞', text: 'Call Childline on 0800 1111 — they\'re really kind and easy to talk to', done: false },
      { icon: '🔒', text: 'Block the person for now while you figure it out', done: false },
    ],
  },
};

// ─── REGION DATA ───────────────────────────────────────────────────────────

const UK_REGIONS = [
  {
    id: 'england',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    name: 'England',
    reportNote: 'Report to Report Fraud — the national service for England.',
  },
  {
    id: 'scotland',
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    name: 'Scotland',
    reportNote: 'Report to Police Scotland on 101 — NOT to Report Fraud.',
  },
  {
    id: 'wales',
    flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    name: 'Wales',
    reportNote: 'Report to Report Fraud. Welsh-language line also available.',
  },
  {
    id: 'northern_ireland',
    flag: '🇬🇧',
    name: 'Northern Ireland',
    reportNote: 'Report to Report Fraud and/or your local PSNI station.',
  },
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

export default function Panic({ profile, onNav }) {
  const isKids = profile === 'kids';

  const [region, setRegion] = useState(
    () => localStorage.getItem('warden.region') || null
  );
  const [incident, setIncident] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [showAllContacts, setShowAllContacts] = useState(false);

  const handleRegion = (r) => {
    setRegion(r);
    localStorage.setItem('warden.region', r);
  };

  const handleIncident = (id) => {
    setIncident(id);
    setCheckedSteps({});
  };

  const toggleStep = (i) => {
    setCheckedSteps(prev => ({ ...prev, [i]: !prev[i] }));
  };

  // Which incidents to show depends on profile
  const INCIDENTS_ELDERLY = [
    FIRST_AID.live_call,
    FIRST_AID.gave_bank_details,
    FIRST_AID.sent_money,
    FIRST_AID.clicked_link,
    FIRST_AID.gave_password,
    FIRST_AID.received_suspicious,
    FIRST_AID.unsure,
  ];

  const INCIDENTS_KIDS = [
    FIRST_AID.kids_gave_password,
    FIRST_AID.kids_shared_location,
    FIRST_AID.kids_clicked_link,
    FIRST_AID.kids_unsure,
  ];

  const incidents = isKids ? INCIDENTS_KIDS : INCIDENTS_ELDERLY;
  const activeIncident = incident ? FIRST_AID[incident] : null;

  // Which contacts to show
  const nationContacts = region ? (UK_HELPLINES.byNation[region] || []) : [];
  const specialistContacts = isKids
    ? UK_HELPLINES.specialist.kids
    : UK_HELPLINES.specialist.elderly;

  // Filter universal contacts — remove victim_support if Scotland (not England/Wales only)
  const universalContacts = UK_HELPLINES.universal.filter(c =>
    !region || c.nations.includes(region)
  );

  const urgencyColour = {
    immediate: 'var(--danger)',
    urgent: 'var(--danger)',
    moderate: 'var(--amber)',
    low: 'var(--safe)',
  };

  return (
    <div className="page-enter">

      {/* ── Calm reassurance band ── */}
      <div className="panic-band">
        <span style={{ fontSize: 13 }}>●</span>
        {isKids
          ? "YOU'RE OKAY · WE'LL HELP YOU THROUGH THIS"
          : "YOU'RE NOT IN TROUBLE · STAY WITH US · WE'LL SORT THIS TOGETHER"}
        <span style={{ fontSize: 13 }}>●</span>
      </div>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <span className="eyebrow">{isKids ? 'I NEED HELP' : 'PANIC MODE'}</span>
          <h2 className="section-title">
            {isKids
              ? <>Tell us what <span className="accent-word">just happened.</span></>
              : <>Tell us what <em>just happened.</em></>}
          </h2>

          <div className="panic-layout">

            {/* ── LEFT COLUMN: Incident + First Aid ── */}
            <div className="panic-left">

              {/* Step 1: What happened */}
              <div className="panic-step-group">
                <div className="panic-step-header">
                  <span className="panic-step-num">1</span>
                  <span>{isKids ? 'What happened?' : 'What happened?'}</span>
                </div>
                <div className="panic-incidents">
                  {incidents.map(inc => (
                    <button
                      key={inc.id}
                      className={`panic-incident-btn${incident === inc.id ? ' active' : ''}`}
                      onClick={() => handleIncident(inc.id)}
                      style={incident === inc.id ? {
                        '--urgency': urgencyColour[inc.urgency] || 'var(--accent)',
                      } : {}}
                    >
                      <span className="panic-incident-emoji">{inc.emoji}</span>
                      <span>{inc.label}</span>
                      {incident === inc.id && (
                        <span style={{ marginLeft: 'auto', color: 'var(--urgency, var(--accent))' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* First Aid response */}
              {activeIncident && (
                <div className="panic-first-aid page-enter" key={activeIncident.id}>
                  <div
                    className="panic-script"
                    style={{ borderLeftColor: urgencyColour[activeIncident.urgency] }}
                  >
                    <div className="panic-script-text">{activeIncident.script}</div>
                    <div className="panic-script-note">{activeIncident.scriptNote}</div>
                  </div>

                  <div className="panic-step-header" style={{ marginTop: 20 }}>
                    <span className="panic-step-num">2</span>
                    <span>Do these steps</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>
                      {Object.values(checkedSteps).filter(Boolean).length} / {activeIncident.steps.length} done
                    </span>
                  </div>

                  <div className="panic-checklist">
                    {activeIncident.steps.map((step, i) => (
                      <div
                        key={i}
                        className={`panic-check-item${checkedSteps[i] ? ' checked' : ''}`}
                        onClick={() => toggleStep(i)}
                      >
                        <span className={`panic-checkbox${checkedSteps[i] ? ' checked' : ''}`}>
                          {checkedSteps[i] ? '✓' : ''}
                        </span>
                        <span className="panic-check-icon">{step.icon}</span>
                        <span style={{
                          flex: 1,
                          textDecoration: checkedSteps[i] ? 'line-through' : 'none',
                          color: checkedSteps[i] ? 'var(--muted)' : 'var(--charcoal)',
                          transition: 'all 0.2s',
                        }}>
                          {step.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: Region + Contacts ── */}
            <div className="panic-right">

              {/* Region selector */}
              <div className="panic-region-box">
                <div className="panic-step-header">
                  <span className="panic-step-num">3</span>
                  <span>Where are you in the UK?</span>
                </div>
                <div className="panic-region-grid">
                  {UK_REGIONS.map(r => (
                    <button
                      key={r.id}
                      className={`panic-region-btn${region === r.id ? ' active' : ''}`}
                      onClick={() => handleRegion(r.id)}
                    >
                      <span style={{ fontSize: 20 }}>{r.flag}</span>
                      <span>{r.name}</span>
                    </button>
                  ))}
                </div>
                {region && (
                  <div className="panic-region-note page-enter">
                    {UK_REGIONS.find(r => r.id === region)?.reportNote}
                  </div>
                )}
              </div>

              {/* Main reporting contact (nation-specific) */}
              {nationContacts.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="panic-contacts-label">
                    {isKids ? 'REPORT IT TO:' : 'REPORT TO:'}
                  </div>
                  {nationContacts.filter(c => c.isMainReporter).map(c => (
                    <ContactCard key={c.id} contact={c} highlight />
                  ))}
                </div>
              )}

              {/* Bank 159 — always first */}
              <div style={{ marginTop: 16 }}>
                <div className="panic-contacts-label">FIRST CALL:</div>
                <ContactCard
                  contact={UK_HELPLINES.universal.find(c => c.id === 'bank_159')}
                  highlight
                />
              </div>

              {/* Specialist contacts for profile */}
              <div style={{ marginTop: 20 }}>
                <div className="panic-contacts-label">
                  {isKids ? 'HELP FOR YOUNG PEOPLE:' : 'SPECIALIST SUPPORT:'}
                </div>
                {specialistContacts.map(c => (
                  <ContactCard key={c.id} contact={c} />
                ))}
              </div>

              {/* Toggle: show all other contacts */}
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 12, fontSize: 13 }}
                onClick={() => setShowAllContacts(s => !s)}
              >
                {showAllContacts ? '↑ Show less' : `+ All UK helplines (${universalContacts.length - 1} more)`}
              </button>

              {showAllContacts && (
                <div style={{ marginTop: 12 }} className="page-enter">
                  {universalContacts
                    .filter(c => c.id !== 'bank_159')
                    .map(c => <ContactCard key={c.id} contact={c} />)}
                  {region && nationContacts
                    .filter(c => !c.isMainReporter)
                    .map(c => <ContactCard key={c.id} contact={c} />)}
                </div>
              )}

              {/* Back to safety */}
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 20 }}
                onClick={() => onNav('home')}
              >
                I'm okay — back to home
              </button>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Contact Card subcomponent ─────────────────────────────────────────────

function ContactCard({ contact, highlight }) {
  if (!contact) return null;

  const priorityColour = {
    HIGH: 'var(--danger)',
    STANDARD: 'var(--accent)',
    EMOTIONAL: 'var(--safe)',
  };

  return (
    <div className={`contact-card${highlight ? ' contact-card-highlight' : ''}`}>
      <div className="contact-card-top">
        <span style={{ fontSize: 24 }}>{contact.emoji}</span>
        <div style={{ flex: 1 }}>
          <div className="contact-name">{contact.name}</div>
          <div className="contact-hours">{contact.hours}</div>
        </div>
        {contact.priority && (
          <span
            className="contact-priority"
            style={{ background: priorityColour[contact.priority] + '18', color: priorityColour[contact.priority] }}
          >
            {contact.priority === 'HIGH' ? 'URGENT' : contact.priority === 'EMOTIONAL' ? 'SUPPORT' : 'ADVICE'}
          </span>
        )}
      </div>
      <p className="contact-desc">{contact.desc}</p>
      <div className="contact-actions">
        {contact.number && (
          <a
            href={`tel:${contact.number.replace(/\s/g, '')}`}
            className="btn btn-primary contact-call-btn"
          >
            📞 {contact.callLabel} — {contact.number}
          </a>
        )}
        {contact.url && contact.url.startsWith('mailto:') && (
          <a href={contact.url} className="btn btn-secondary contact-call-btn">
            📧 {contact.callLabel}
          </a>
        )}
        {contact.url && !contact.url.startsWith('mailto:') && (
          <a
            href={contact.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary contact-call-btn"
          >
            🌐 {contact.callLabel || 'Visit website'}
          </a>
        )}
      </div>
    </div>
  );
}
