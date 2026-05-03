import React from 'react';

// Nav — top sticky bar with profile chip + panic
function Nav({ profile, onSwitchProfile, onNav, current, onPanic }) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'detector', label: profile === 'kids' ? 'Check it' : 'Detector' },
    { id: 'dna', label: profile === 'kids' ? '🧬 Quiz' : '🧬 Scam DNA' },
    { id: 'twin', label: profile === 'kids' ? 'Scam Twin' : 'Scam Twin' },
    { id: 'learn', label: profile === 'kids' ? 'Game Zone' : 'Learn' },
    { id: 'tools', label: profile === 'kids' ? '🧰 Safety Kit' : '🔗 Trusted Tools' },
  ];
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="logo" onClick={() => onNav('home')} style={{ cursor: 'pointer' }}>
          Truth<span className="ly">ly</span>
        </div>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {tabs.map(t => (
            <span key={t.id}
              className={'nav-link' + (current === t.id ? ' active' : '')}
              onClick={() => onNav(t.id)}>
              {t.label}
            </span>
          ))}
          <button className="profile-chip" onClick={onSwitchProfile} title="Switch profile">
            <span className="profile-chip-avatar">
              {profile === 'kids' ? '🦊' : '🫖'}
            </span>
            {profile === 'kids' ? 'Kids' : 'Senior'}
            <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 4 }}>▾</span>
          </button>
          <button className="panic-btn" onClick={onPanic}>
            <span style={{ fontSize: 12 }}>●</span> {profile === 'kids' ? 'I NEED HELP' : 'PANIC'}
          </button>
        </div>
      </div>
    </nav>
  );
}
export default Nav;
