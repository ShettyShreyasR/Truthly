// App — main shell, routes, profile state, theme switching
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "profile": "elderly",
  "showOnboarding": true,
  "grain": true,
  "animations": true
}/*EDITMODE-END*/;

function App() {
  // Persist profile in localStorage so refresh preserves choice
  const [profile, setProfile] = React.useState(() =>
    localStorage.getItem('truthly.profile') || null
  );
  const [page, setPage] = React.useState(() =>
    localStorage.getItem('truthly.page') || 'home'
  );

  // Tweaks — only profile is the meaningful tweak; the rest is for show
  const { tweaks, setTweak } = (window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : { tweaks: TWEAK_DEFAULTS, setTweak: () => {} });

  // Apply theme to <html>
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile || 'elderly');
    if (profile) localStorage.setItem('truthly.profile', profile);
  }, [profile]);

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
    return <window.Onboarding onPick={handlePick} />;
  }

  const goto = (p) => setPage(p);

  return (
    <div className="shell">
      <window.Nav
        profile={profile}
        onSwitchProfile={handleSwitch}
        onNav={goto}
        current={page}
        onPanic={() => goto('panic')}
      />
      {page === 'home' && <window.Home profile={profile} onNav={goto} />}
      {page === 'detector' && <window.Detector profile={profile} onTryTwin={() => goto('twin')} onNav={goto} />}
      {page === 'twin' && <window.ScamTwin profile={profile} onNav={goto} />}
      {page === 'panic' && <window.Panic profile={profile} onNav={goto} />}
      {page === 'learn' && <window.Learn profile={profile} onNav={goto} />}

      {/* Tweaks Panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Profile">
            <window.TweakRadio
              label="Active profile"
              value={profile}
              onChange={(v) => { setProfile(v); setTweak('profile', v); }}
              options={[
                { value: 'elderly', label: '🫖 Senior' },
                { value: 'kids', label: '🦊 Kids' },
              ]}
            />
            <window.TweakButton label="Show onboarding again" onClick={handleReset} />
          </window.TweakSection>
          <window.TweakSection title="Navigate">
            <window.TweakSelect
              label="Page"
              value={page}
              onChange={goto}
              options={[
                { value: 'home', label: 'Home' },
                { value: 'detector', label: 'Detector' },
                { value: 'twin', label: 'Scam Twin' },
                { value: 'panic', label: 'Panic Mode' },
                { value: 'learn', label: profile === 'kids' ? 'Game Zone' : 'Learn' },
              ]}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
