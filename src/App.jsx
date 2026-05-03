import React from 'react';
import './styles.css';
import Onboarding from './components/Onboarding';
import Nav from './components/Nav';
import Home from './components/Home';
import Detector from './components/Detector';
import ScamTwin from './components/ScamTwin';
import Panic from './components/Panic';
import Learn from './components/Learn';
import ScamDNA from './components/ScamDNA';
import AssistPanel from './components/AssistPanel';
import TweaksPanel, { useTweaks, TweakSection, TweakRadio, TweakButton, TweakSelect } from './components/TweaksPanel';

// App — main shell, routes, profile state, theme switching
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "profile": "elderly",
  "showOnboarding": true,
  "grain": true,
  "animations": true
}/*EDITMODE-END*/;

function App() {
  const [showTweaks, setShowTweaks] = React.useState(false);
  const [apiStatus, setApiStatus] = React.useState('unknown'); // 'ok' | 'down' | 'unknown'

  React.useEffect(() => {
    fetch((import.meta.env?.VITE_API_URL || 'http://localhost:8000') + '/health')
      .then(r => r.json())
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('down'));
  }, []);

  // Persist profile in localStorage so refresh preserves choice
  const [profile, setProfile] = React.useState(() =>
    localStorage.getItem('truthly.profile') || null
  );
  const [page, setPage] = React.useState(() =>
    localStorage.getItem('truthly.page') || 'home'
  );
  const [detectorContext, setDetectorContext] = React.useState('');

  // Tweaks — only profile is the meaningful tweak; the rest is for show
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme to <html>
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile || 'elderly');
    if (profile) localStorage.setItem('truthly.profile', profile);
  }, [profile]);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        setShowTweaks(s => !s);
      }
    };
    addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('truthly.page', page);
  }, [page]);

  const handlePick = (p) => {
    setProfile(p);
    setTweak('profile', p);
  };

  const handleSwitch = () => {
    const next = profile === 'kids' ? 'elderly' : 'kids';
    setProfile(next);
    setTweak('profile', next);
  };

  const handleReset = () => {
    localStorage.removeItem('truthly.profile');
    localStorage.removeItem('truthly.page');
    setProfile(null);
    setPage('home');
  };

  if (!profile) {
    return <Onboarding onPick={handlePick} />;
  }

  const goto = (p) => setPage(p);

  return (
    <div className="shell">
      <Nav
        profile={profile}
        onSwitchProfile={handleSwitch}
        onNav={goto}
        current={page}
        onPanic={() => goto('panic')}
      />
      {page === 'home' && <Home profile={profile} onNav={goto} />}
      {page === 'detector' && <Detector profile={profile} onTryTwin={() => goto('twin')} onNav={goto} apiStatus={apiStatus} onContextChange={setDetectorContext} />}
      {page === 'twin' && <ScamTwin profile={profile} onNav={goto} apiStatus={apiStatus} />}
      {page === 'panic' && <Panic profile={profile} onNav={goto} />}
      {page === 'learn' && <Learn profile={profile} onNav={goto} />}
      {page === 'dna' && <ScamDNA profile={profile} onNav={goto} />}

      {/* Tweaks Panel */}
      {showTweaks && TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="Profile">
            <TweakRadio
              label="Active profile"
              value={profile}
              onChange={(v) => { setProfile(v); setTweak('profile', v); }}
              options={[
                { value: 'elderly', label: '🫖 Senior' },
                { value: 'kids', label: '🦊 Kids' },
              ]}
            />
            <TweakButton label="Show onboarding again" onClick={handleReset} />
          </TweakSection>
          <TweakSection title="Navigate">
            <TweakSelect
              label="Page"
              value={page}
              onChange={goto}
              options={[
                { value: 'home', label: 'Home' },
                { value: 'detector', label: 'Detector' },
                { value: 'twin', label: 'Scam Twin' },
                { value: 'dna', label: 'Scam DNA' },
                { value: 'panic', label: 'Panic Mode' },
                { value: 'learn', label: profile === 'kids' ? 'Game Zone' : 'Learn' },
              ]}
            />
          </TweakSection>
        </TweaksPanel>
      )}

      <AssistPanel
        profile={profile}
        currentPage={page}
        detectorContext={detectorContext}
        onNav={goto}
      />

      <footer className="app-footer">
        <span>No accounts. No tracking.</span>
        <span>Messages are sent to Claude for pattern analysis and are not stored by Truthly.</span>
        <button className="forget-btn" onClick={() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        }}>
          Forget me
        </button>
      </footer>
    </div>
  );
}




export default App;
