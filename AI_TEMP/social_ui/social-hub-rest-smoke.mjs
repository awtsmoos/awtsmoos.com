// B"H
import assert from 'node:assert/strict';
const origin = 'http://127.0.0.1:8080';
const pass = [];
async function text(path) { const r = await fetch(origin + path); return { status: r.status, text: await r.text() }; }
async function json(path, options) { const r = await fetch(origin + path, options); const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = { raw: t }; } return { status: r.status, json: j }; }
async function mustText(name, path, needle) { const r = await text(path); assert.ok(r.status >= 200 && r.status < 300, `${name} ${r.status}`); assert.ok(r.text.includes(needle), `${name} missing ${needle}`); pass.push(name); }
async function mustJson(name, path, check, options) { const r = await json(path, options); assert.ok(r.status >= 200 && r.status < 300, `${name} ${r.status}`); assert.ok(check(r.json), `${name} bad ${JSON.stringify(r.json).slice(0, 400)}`); pass.push(name); }
await mustText('hub page live socket label', '/social/', 'BH_SOCIAL_HUB');
await mustText('hub socket js asset', '/scripts/awtsmoos/social/hub/socket.js', 'SOCIAL_SUBSCRIBE');
await mustText('hub render live tab', '/scripts/awtsmoos/social/hub/render.js', 'Live Socket');
await mustText('email layout social hub tag source', '/email/ui/layout.js', 'Social Hub');
await mustText('email network social socket source', '/email/network.js', 'SOCIAL_EVENT');
await mustText('email css social tag', '/email/css/social-shell.css', 'mail-social-hub-tag');
await mustJson('http live subscribe', '/api/social/live/subscribe', j => j.success, { method: 'POST', body: new URLSearchParams({ aliasId: 'hubSmoke', channel: 'alias:hubSmoke' }) });
await mustJson('http live publish', '/api/social/live/publish', j => j.success, { method: 'POST', body: new URLSearchParams({ actor: 'hubSmoke', channel: 'alias:hubSmoke', type: 'smoke', payload: JSON.stringify({ ok: true }) }) });
await mustJson('http live replay', '/api/social/live/replay?channel=alias:hubSmoke&limit=3', j => j.success && Array.isArray(j.success));
await mustJson('v2 remains gone', '/api/v2/social/meta', j => j.error && j.error.code === 'INVALID_ROUTE');
console.log(JSON.stringify({ pass, fail: [] }, null, 2));
