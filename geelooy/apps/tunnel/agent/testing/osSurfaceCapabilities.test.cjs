// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actions.js');
const Priority = require('../lib/runtime/priority.js');

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-os-surface-'));
  const config = { root, tunnelName: 'os-surface-test' };
  const actions = buildActions(config, { action: 'awtsmoosOsBrowse' }, null);
  assert.equal(typeof actions.awtsmoosOsBrowse, 'function');
  assert.equal(typeof actions.awtsmoosCapabilities, 'function');

  const rootBrowse = await actions.awtsmoosOsBrowse();
  assert.equal(rootBrowse.ok, true);
  assert.ok(rootBrowse.surfaces.some(x => x.href === 'awtsmoos://streams'));

  const streams = await buildActions(config, { action: 'awtsmoosOsBrowse', uri: 'awtsmoos://streams' }, null).awtsmoosOsBrowse();
  assert.equal(streams.ok, true);
  assert.equal(streams.surface.title, 'Action Streams');
  assert.ok(streams.streamPath.includes('action-stream.jsonl'));

  const caps = await buildActions(config, { action: 'awtsmoosCapabilities' }, null).awtsmoosCapabilities();
  assert.equal(caps.ok, true);
  assert.equal(caps.features.actionStream, true);
  assert.equal(caps.features.scanWorkers, true);
  assert.equal(caps.features.chromeTargetLeases, true);
  assert.equal(caps.features.nodeDomRuntime, true);

  assert.equal(Priority.laneForAction('awtsmoosCapabilities', 'fs'), Priority.LANES.P0);
  console.log(JSON.stringify({ ok: true, suite: 'os-surface-capabilities' }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
