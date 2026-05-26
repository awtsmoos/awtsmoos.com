// B"H
import assert from 'node:assert/strict';
import { TinyDocument } from './helpers/tinyPlatformDom.mjs';
import { mountNotificationsPanel } from '../ui/notificationsPanel.js';

const wait = () => new Promise(resolve => setTimeout(resolve, 0));
const document = new TinyDocument();
globalThis.document = document;
globalThis.window = {
  setInterval(fn) {
    globalThis.__poller = fn;
    return 1;
  }
};

const calls = [];
globalThis.fetch = async (url, opts = {}) => {
  const href = String(url);
  calls.push({ url: href, opts });
  if (href.includes('/poll?')) return json({ cursor: 77, success: [{ id: 'n2' }] });
  if (href.endsWith('/read')) return json({ success: true });
  return json({ success: [{ id: 'n1', title: 'Reply arrived', body: 'A section received a reply.', actionUrl: '/post/p1#s2' }] });
};

function json(body) {
  return { ok: true, status: 200, statusText: 'OK', async json() { return body; } };
}

const panel = mountNotificationsPanel({ root: document.body, aliasId: 'alice' });
await wait();
assert.ok(panel, 'panel should mount');
assert.equal(mountNotificationsPanel({ root: document.body, aliasId: 'alice' }), null, 'panel should mount once');
assert.equal(panel.querySelector('.awtsmoos-notifications-list').hidden, true);
assert.equal(panel.querySelector('.awtsmoos-notifications-toggle').getAttribute('aria-expanded'), 'false');
assert.match(panel.querySelector('.awtsmoos-notifications-toggle').textContent, /Notifications \(1\)/);

await panel.querySelector('.awtsmoos-notifications-toggle').onclick();
assert.equal(panel.querySelector('.awtsmoos-notifications-list').hidden, false);
assert.equal(panel.querySelector('.awtsmoos-notifications-toggle').getAttribute('aria-expanded'), 'true');
assert.match(panel.textContent, /Reply arrived/);
assert.match(panel.textContent, /A section received a reply/);

const readButton = panel.querySelector('.awtsmoos-notification-actions').querySelector('button');
await readButton.onclick();
assert.ok(calls.some(call => call.url.endsWith('/api/social/notifications/alice/n1/read') && call.opts.method === 'POST'));

await globalThis.__poller();
assert.ok(calls.some(call => call.url.includes('/api/social/notifications/alice/poll?since=0')));
assert.ok(calls.some(call => call.url.includes('/api/social/notifications/alice?includeRead=no')));

console.log('B"H notificationsPanelNodeSimulation.test passed');
