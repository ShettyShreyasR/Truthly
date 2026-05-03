// src/components/SafeTools.jsx
// Drop this file into src/components/ and add it to your nav + App.jsx routing

export default function SafeTools({ profile }) {
  const isKids = profile === 'kids';

  const TOOLS = [
    {
      id: 'hibp',
      emoji: '🔓',
      name: 'Have I Been Pwned?',
      url: 'https://haveibeenpwned.com',
      oneLiner: 'Check if your email address has appeared in a known data breach.',
      tag: 'Data breaches',
      kidsLabel: 'Has your email been leaked?',
    },
    {
      id: 'actionfraud',
      emoji: '🚨',
      name: 'Report Fraud (UK)',
      url: 'https://www.reportfraud.police.uk',
      oneLiner: 'The official UK service for reporting fraud and cybercrime.',
      tag: 'Report it',
      kidsLabel: 'Report something bad online',
    },
    {
      id: 'ncsc_cyberaware',
      emoji: '🛡️',
      name: 'NCSC Cyber Aware',
      url: 'https://www.ncsc.gov.uk/cyberaware',
      oneLiner: 'Government-backed guidance on passwords, accounts, and staying safe online.',
      tag: 'Official advice',
      kidsLabel: 'Stay safe online — official guide',
    },
    {
      id: 'whois',
      emoji: '🌐',
      name: 'WHOIS Domain Lookup',
      url: 'https://www.whois.com/whois/',
      oneLiner: 'Check who registered a website and when — useful for spotting fake domains.',
      tag: 'Check a website',
      kidsLabel: 'Is this website real?',
    },
    {
      id: 'virustotal',
      emoji: '🔬',
      name: 'VirusTotal',
      url: 'https://www.virustotal.com',
      oneLiner: 'Paste a suspicious link to scan it for malware before you click it.',
      tag: 'Scan a link',
      kidsLabel: 'Is this link safe to click?',
    },
    {
      id: 'checkyouremail',
      emoji: '📧',
      name: 'Email Header Analyser',
      url: 'https://mxtoolbox.com/EmailHeaders.aspx',
      oneLiner: 'Paste an email header to see exactly where a message really came from.',
      tag: 'Check sender',
      kidsLabel: 'Did this email come from who it says?',
    },
    {
      id: 'ncsc_phishing',
      emoji: '📩',
      name: 'Report a Scam Email',
      url: 'mailto:report@phishing.gov.uk',
      oneLiner: 'Forward suspicious emails to the NCSC — they can take down scam websites.',
      tag: 'Report email',
      kidsLabel: 'Forward a dodgy email to the government',
      isEmail: true,
    },
    {
      id: 'ceop',
      emoji: '👮',
      name: 'CEOP Safety Centre',
      url: 'https://www.ceop.police.uk/safety-centre/',
      oneLiner: 'Report if an adult has made you or a child feel unsafe online.',
      tag: 'Child safety',
      kidsLabel: 'Someone online made me uncomfortable',
    },
    {
      id: '159',
      emoji: '📞',
      name: 'Call 159 — Bank Fraud Line',
      url: 'tel:159',
      oneLiner: 'Dial 159 to reach your bank\'s real fraud team directly. Free from any UK phone.',
      tag: 'Call now',
      kidsLabel: 'Call your bank\'s fraud team',
      isPhone: true,
    },
    {
      id: 'takefive',
      emoji: '⏸️',
      name: 'Take Five to Stop Fraud',
      url: 'https://www.takefive-stopfraud.org.uk',
      oneLiner: 'The UK\'s national campaign — stop, challenge, protect before you act.',
      tag: 'Awareness',
      kidsLabel: 'Stop and think before you do anything',
    },
    {
      id: 'citizensadvice',
      emoji: '🤝',
      name: 'Citizens Advice — Scams',
      url: 'https://www.citizensadvice.org.uk/consumer/scams/',
      oneLiner: 'Free, independent advice on what to do if you\'ve been targeted by a scam.',
      tag: 'Get advice',
      kidsLabel: 'Free help and advice',
    },
    {
      id: 'passwordcheck',
      emoji: '🔑',
      name: 'Password Strength Checker',
      url: 'https://www.security.org/how-secure-is-my-password/',
      oneLiner: 'Test how long it would take to crack your password — nothing is sent or stored.',
      tag: 'Test a password',
      kidsLabel: 'Is my password strong enough?',
    },
  ];

  // Kids mode shows a curated subset
  const visibleTools = isKids
    ? TOOLS.filter(t => ['hibp', 'ceop', 'virustotal', 'actionfraud', 'takefive', 'passwordcheck'].includes(t.id))
    : TOOLS;

  const tagColours = {
    'Data breaches': { bg: 'rgba(83,74,183,0.1)', text: '#3C3489' },
    'Report it':     { bg: 'rgba(230,57,70,0.08)', text: '#A32D2D' },
    'Official advice':{ bg: 'rgba(76,175,130,0.1)', text: '#0F6E56' },
    'Check a website':{ bg: 'rgba(255,107,53,0.1)', text: '#993C1D' },
    'Scan a link':   { bg: 'rgba(239,159,39,0.1)', text: '#854F0B' },
    'Check sender':  { bg: 'rgba(55,138,221,0.1)', text: '#185FA5' },
    'Report email':  { bg: 'rgba(83,74,183,0.1)', text: '#3C3489' },
    'Child safety':  { bg: 'rgba(212,83,126,0.1)', text: '#72243E' },
    'Call now':      { bg: 'rgba(230,57,70,0.08)', text: '#A32D2D' },
    'Awareness':     { bg: 'rgba(76,175,130,0.1)', text: '#0F6E56' },
    'Get advice':    { bg: 'rgba(55,138,221,0.1)', text: '#185FA5' },
    'Test a password':{ bg: 'rgba(239,159,39,0.1)', text: '#854F0B' },
  };

  const getHref = (tool) => {
    if (tool.isEmail || tool.isPhone) return tool.url;
    return tool.url;
  };

  const getLinkLabel = (tool) => {
    if (tool.isPhone) return 'Call now →';
    if (tool.isEmail) return 'Open email →';
    return 'Visit →';
  };

  return (
    <div className="page-enter">
      <section className="section">
        <div className="container">

          <span className="eyebrow">
            {isKids ? 'SAFETY TOOLKIT' : 'TRUSTED TOOLS'}
          </span>

          <h2 className="section-title">
            {isKids
              ? <><span className="accent-word">Tools to keep you safe.</span> All free, all official.</>
              : <>Free tools. <em>Verified sources. No sign-up required.</em></>}
          </h2>

          <p className="section-subtitle">
            {isKids
              ? 'These are real, safe websites and tools you can use any time. Ask a grown-up if you\'re not sure.'
              : 'Every link below goes to an official or well-established service. None of these are Truthly — they are independent resources we recommend.'}
          </p>

          {/* Disclaimer strip */}
          <div className="tools-disclaimer">
            <span>🔗</span>
            <span>
              {isKids
                ? 'These links open real websites outside of Truthly. They are safe to visit.'
                : 'These links open external websites. Truthly is not affiliated with any of them — we link to them because they are genuinely useful.'}
            </span>
          </div>

          {/* Tool cards grid */}
          <div className="tools-grid">
            {visibleTools.map((tool) => {
              const tc = tagColours[tool.tag] || { bg: 'var(--cream)', text: 'var(--muted)' };
              return (
                <div key={tool.id} className="tool-card">

                  {/* Card top row */}
                  <div className="tool-card-top">
                    <span className="tool-emoji">{tool.emoji}</span>
                    <span
                      className="tool-tag"
                      style={{ background: tc.bg, color: tc.text }}
                    >
                      {tool.tag}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="tool-name">
                    {isKids ? tool.kidsLabel || tool.name : tool.name}
                  </div>

                  {/* One-liner */}
                  <p className="tool-desc">
                    {tool.oneLiner}
                  </p>

                  {/* Link */}
                  <a
                    href={getHref(tool)}
                    target={tool.isEmail || tool.isPhone ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="tool-link"
                  >
                    {getLinkLabel(tool)}
                  </a>

                </div>
              );
            })}
          </div>

          {/* Bottom note */}
          <p className="tools-bottom-note">
            {isKids
              ? 'Remember — always tell a parent or trusted adult before using any of these if you\'re unsure.'
              : 'If you think you\'ve been scammed, start with 159 (your bank) and Report Fraud (0300 123 2040). Everything else can wait.'}
          </p>

        </div>
      </section>
    </div>
  );
}
