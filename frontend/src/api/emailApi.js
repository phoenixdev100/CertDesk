const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function testSmtp(smtp) {
  const res = await fetch(`${API_BASE}/test-smtp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smtp }),
  });
  return res.json();
}

export async function sendCertificate(payload) {
  const res = await fetch(`${API_BASE}/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}
