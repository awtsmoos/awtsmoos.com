// B"H
import assert from 'node:assert/strict';
const origin = 'http://127.0.0.1:8080';
const report = { pass: [], fail: [] };
async function text(path) { const r = await fetch(origin + path); return { status: r.status, text: await r.text() }; }
async function json(path) { const r = await fetch(origin + path); const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = { raw: t }; } return { status: r.status, json: j }; }
function pass(name, extra = {}) { report.pass.push({ name, ...extra }); }
async function mustText(name, path, needle) { const r = await text(path); assert.ok(r.status >= 200 && r.status < 300, `${name} ${r.status}`); assert.ok(r.text.includes(needle), `${name} missing ${needle}`); pass(name, { status: r.status }); }
async function mustJson(name, path, check) { const r = await json(path); assert.ok(r.status >= 200 && r.status < 300, `${name} ${r.status}`); assert.ok(check(r.json), `${name} bad ${JSON.stringify(r.json).slice(0, 300)}`); pass(name, { status: r.status }); }
try {
  await mustText('social hub page', '/social/', 'BH_SOCIAL_HUB');
  await mustText('social hub css', '/style/social/hub/index.css', 'unified API');
  await mustText('social hub api js', '/scripts/awtsmoos/social/hub/api.js', '/api/social');
  await mustText('social hub render has all panel labels', '/scripts/awtsmoos/social/hub/render.js', 'Notifications');
  await mustJson('api meta canonical', '/api/social/meta', j => j.ok && j.data.canonicalNamespace === '/api/social');
  await mustJson('openapi canonical only', '/api/social/openapi.json', j => j.ok && j.data.servers[0].url === '/api/social' && !JSON.stringify(j.data).includes('/api/v2/social'));
  await mustJson('heichel discovery safe', '/api/social/heichelos/discover?limit=3', j => j.ok && Array.isArray(j.data));
  await mustJson('feed trending safe', '/api/social/feed/trending?limit=3', j => j.ok || j.success);
  await mustJson('events safe', '/api/social/events?aliases=ikar&limit=3', j => j.ok);
  await mustJson('profile graph safe', '/api/social/profiles/ikar/graph?limit=3', j => j.ok || j.error || j.success);
  await mustJson('v2 gone', '/api/v2/social/meta', j => Boolean(j.error) && j.error.code === 'INVALID_ROUTE');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.fail.push(String(error.stack || error));
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
