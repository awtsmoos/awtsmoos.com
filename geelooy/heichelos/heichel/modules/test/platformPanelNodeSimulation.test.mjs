// B"H
import assert from 'node:assert/strict';
import { TinyDocument, TinyFormData } from './helpers/tinyPlatformDom.mjs';
import { mountPlatformPanel } from '../ui/platformPanel.js';

const wait = () => new Promise(resolve => setTimeout(resolve, 0));

function installBrowserVessels() {
  const document = new TinyDocument();
  globalThis.document = document;
  globalThis.window = { curAlias: 'testerAlias', heichelId: 'testHeichel' };
  globalThis.FormData = TinyFormData;
  return document;
}

function installFetchRecorder({ failPattern = '' } = {}) {
  const calls = [];
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url);
    calls.push({ url: href, opts });
    if (failPattern && href.includes(failPattern)) return json({ error: 'offline' }, false, 503);
    if (href.includes('packed/stats')) return json({ success: [{ shard: 'core', records: 7, logicalKeys: 5 }] });
    if (href.includes('packed/snapshot')) return json({ success: { manifests: 2, migrations: 1 } });
    if (href.includes('search/query')) return json({ success: [{ id: 'search-spark', title: 'Search Spark' }] });
    if (href.includes('feed/heichel')) return json({ success: { items: [{ postId: 'feed-post', title: 'Feed Post' }] } });
    if (href.includes('live/replay')) return json({ success: [{ type: 'presence', title: 'Alias is online' }] });
    if (href.includes('sync/pull')) return json({ success: [{ type: 'sync', title: 'Pulled shard delta' }], cursor: 8844 });
    if (href.includes('mod/queues')) return json({ success: [{ id: 'queue-one' }, { id: 'queue-two' }] });
    if (href.includes('migrations/posts/v2/dryRun')) return json({ success: { found: 3 } });
    return json({ success: [] });
  };
  return calls;
}

function json(body, ok = true, status = 200) {
  return { ok, status, statusText: ok ? 'OK' : 'Service Unavailable', async json() { return body; } };
}

function textOf(panel) { return panel.querySelector('[data-platform-output]').textContent; }
function statusOf(panel) { return panel.querySelector('[data-platform-status]').textContent; }
function action(panel, name) { return panel.querySelector(`[data-platform-action="${name}"]`); }

async function mountWithFetch(fetchOptions = {}) {
  const document = installBrowserVessels();
  const calls = installFetchRecorder(fetchOptions);
  const panel = mountPlatformPanel({ root: document.body, aliasId: 'a', heichelId: 'h' });
  await wait();
  return { calls, document, panel };
}

async function testMountToggleAndDbRender() {
  const { calls, document, panel } = await mountWithFetch();
  assert.ok(panel, 'panel should mount into the supplied root');
  assert.equal(mountPlatformPanel({ root: document.body }), null, 'mount should be idempotent');
  const actionNames = [...panel.querySelectorAll('[data-platform-action]')].map(button => button.dataset.platformAction);
  assert.deepEqual(actionNames, [...new Set(actionNames)], 'platform action buttons must not be duplicated');
  assert.deepEqual(actionNames.sort(), ['db', 'feed', 'ops', 'presence', 'sync']);
  assert.match(textOf(panel), /core: 7 records \/ 5 keys/);
  assert.match(textOf(panel), /manifests: 2/);
  assert.ok(calls.some(call => call.url.endsWith('/api/social/packed/stats')));
  const toggle = panel.querySelector('.awtsmoos-platform-toggle');
  const body = panel.querySelector('.awtsmoos-platform-body');
  assert.equal(body.hidden, true);
  toggle.onclick();
  assert.equal(body.hidden, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
}

async function testSearchSubmitRendersResults() {
  const { panel } = await mountWithFetch();
  const form = panel.querySelector('.awtsmoos-platform-search');
  form.querySelector('[name="q"]').value = 'spark';
  await form.onsubmit({ preventDefault() {}, currentTarget: form });
  assert.match(textOf(panel), /Search \(1\)/);
  assert.match(textOf(panel), /Search Spark/);
}

async function testFeedPresenceAndSyncActionsMoveRealData() {
  const { calls, panel } = await mountWithFetch();
  await action(panel, 'feed').onclick();
  assert.match(textOf(panel), /Feed Post/);
  await action(panel, 'presence').onclick();
  assert.match(textOf(panel), /Alias is online/);
  await action(panel, 'sync').onclick();
  assert.match(textOf(panel), /Pulled shard delta/);
  assert.ok(calls.some(call => call.url.includes('packed/feed/materialize') && call.opts.method === 'POST'));
  assert.ok(calls.some(call => call.url.includes('live/presence') && call.opts.method === 'POST'));
  assert.ok(calls.some(call => call.url.includes('abuse/rateLimit/check') && call.opts.method === 'POST'));
}

async function testOpsActionSurfacesModerationAndMigrationState() {
  const { calls, panel } = await mountWithFetch();
  await action(panel, 'ops').onclick();
  assert.match(textOf(panel), /moderation queues: 2/);
  assert.match(textOf(panel), /migration dry-run candidates: 3/);
  assert.ok(calls.some(call => call.url.endsWith('/api/social/mod/queues')));
  assert.ok(calls.some(call => call.url.includes('/api/social/migrations/posts/v2/dryRun?')));
}

async function testServerFailureShowsLivingErrorState() {
  const failures = [
    ['search/query', async panel => panel.querySelector('.awtsmoos-platform-search').onsubmit({ preventDefault() {}, currentTarget: panel.querySelector('.awtsmoos-platform-search') })],
    ['packed/feed/materialize', async panel => action(panel, 'feed').onclick()],
    ['live/presence', async panel => action(panel, 'presence').onclick()],
    ['abuse/rateLimit/check', async panel => action(panel, 'presence').onclick()],
    ['live/replay', async panel => action(panel, 'presence').onclick()],
    ['sync/pull', async panel => action(panel, 'sync').onclick()],
    ['packed/stats', async panel => action(panel, 'db').onclick()]
  ];
  for (const [failPattern, trigger] of failures) {
    const { panel } = await mountWithFetch({ failPattern });
    const form = panel.querySelector('.awtsmoos-platform-search');
    form.querySelector('[name="q"]').value = 'storm';
    await trigger(panel);
    assert.match(statusOf(panel), /failed|unavailable/i, failPattern);
    assert.match(textOf(panel), /failed|Unable to/i, failPattern);
  }
}

await testMountToggleAndDbRender();
await testSearchSubmitRendersResults();
await testFeedPresenceAndSyncActionsMoveRealData();
await testOpsActionSurfacesModerationAndMigrationState();
await testServerFailureShowsLivingErrorState();
console.log('B"H platformPanelNodeSimulation.test passed');
