const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function detectScam(message, profile) {
  const res = await fetch(`${BASE}/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, profile }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function scamTwinReply(payload) {
  const res = await fetch(`${BASE}/twin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function assistChat(payload) {
  const res = await fetch(`${BASE}/assist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function generateScenarios(profile, difficulty = 'realistic', excludeTypes = []) {
  const res = await fetch(`${BASE}/twin/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, difficulty, exclude_types: excludeTypes }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function scamTwinTurn(scenario, history, userMessage, profile, difficulty = 'realistic') {
  const res = await fetch(`${BASE}/twin/turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario,
      history,
      user_message: userMessage,
      profile,
      difficulty,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}
