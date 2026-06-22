// B"H
import assert from 'node:assert/strict';
const url = 'ws://127.0.0.1:8080';
const channel = `social:smoke:${Date.now().toString(36)}`;
const seen = [];
const ws = new WebSocket(url);
const done = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`Timed out; seen ${JSON.stringify(seen)}`)), 5000);
  ws.onerror = error => reject(error);
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'LOGIN', aliasId: 'socialHubSmoke' }));
    ws.send(JSON.stringify({ type: 'SOCIAL_SUBSCRIBE', aliasId: 'socialHubSmoke', channel }));
    ws.send(JSON.stringify({ type: 'SOCIAL_PRESENCE', aliasId: 'socialHubSmoke', channel, status: 'testing' }));
    ws.send(JSON.stringify({ type: 'SOCIAL_PING', id: 'smoke' }));
    setTimeout(() => ws.send(JSON.stringify({ type: 'SOCIAL_PUBLISH', aliasId: 'socialHubSmoke', actor: 'socialHubSmoke', channel, kind: 'smoke.event', payload: { ok: true } })), 150);
  };
  ws.onmessage = event => {
    const data = JSON.parse(event.data);
    seen.push(data.type);
    if (seen.includes('ACK') && seen.includes('SOCIAL_SUBSCRIBED') && seen.includes('SOCIAL_PONG') && seen.includes('SOCIAL_EVENT')) {
      clearTimeout(timer);
      ws.close();
      resolve({ pass: true, seen });
    }
  };
});
try { console.log(JSON.stringify(await done, null, 2)); }
catch (error) { console.error(JSON.stringify({ pass: false, error: String(error.stack || error), seen }, null, 2)); process.exit(1); }
