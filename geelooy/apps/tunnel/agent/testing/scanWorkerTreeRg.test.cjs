// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actions.js');
const Priority = require('../lib/runtime/priority.js');

async function call(config, payload) {
  const actions = buildActions(config, payload, null);
  assert.equal(typeof actions[payload.action], 'function', 'missing action ' + payload.action);
  return await actions[payload.action]();
}

async function waitFor(config, taskId, action) {
  for (let i = 0; i < 40; i++) {
    const status = await call(config, { action, taskId });
    if (status.status !== 'running') return status;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return await call(config, { action, taskId });
}

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-scan-worker-'));
  await fsp.mkdir(path.join(root, 'src'), { recursive: true });
  await fsp.mkdir(path.join(root, 'node_modules', 'ignored'), { recursive: true });
  await fsp.writeFile(path.join(root, 'src', 'alpha.js'), 'const word = "awtsmoos";\nconsole.log(word);\n');
  await fsp.writeFile(path.join(root, 'src', 'beta.txt'), 'awtsmoos appears here\n');
  await fsp.writeFile(path.join(root, 'node_modules', 'ignored', 'skip.js'), 'awtsmoos should be skipped\n');

  const config = { root, allowCommands: true, tools: { fsRead: true, fsTree: true, command: true } };

  const tree = await call(config, { action: 'treeStart', path: '.', depth: 4, maxNodes: 50, logicalAgentId: 'tree-agent', roomId: 'room-tree' });
  assert.equal(tree.ok, true);
  assert.equal(tree.action, 'treeStart');
  assert.equal(tree.workerType, 'tree');
  assert.ok(tree.taskId);
  assert.equal(tree.pagePayload.action, 'treePage');
  assert.equal(tree.cancelPayload.action, 'treeCancel');
  assert.equal(tree.processIdentity.logicalAgentId, 'tree-agent');

  const treeDone = await waitFor(config, tree.taskId, 'treeStatus');
  assert.equal(treeDone.status, 'completed');
  const treePage = await call(config, { action: 'treePage', taskId: tree.taskId, limit: 5 });
  assert.equal(treePage.ok, true);
  assert.ok(treePage.items.some(item => item.path === 'src/alpha.js'));
  assert.ok(treePage.items.some(item => item.type === 'skip' && item.path.includes('node_modules')));
  const treeSummary = await call(config, { action: 'treeSummary', taskId: tree.taskId });
  assert.equal(treeSummary.ok, true);
  assert.ok(treeSummary.summary.files >= 2);

  const rg = await call(config, { action: 'rgStart', query: 'awtsmoos', path: '.', literal: true, logicalAgentId: 'rg-agent', roomId: 'room-rg' });
  assert.equal(rg.ok, true);
  assert.equal(rg.action, 'rgStart');
  assert.equal(rg.workerType, 'rg');
  assert.ok(rg.taskId);
  assert.equal(rg.pagePayload.action, 'rgPage');
  assert.equal(rg.processIdentity.logicalAgentId, 'rg-agent');

  const rgDone = await waitFor(config, rg.taskId, 'rgStatus');
  assert.equal(rgDone.status, 'completed');
  const rgPage = await call(config, { action: 'rgPage', taskId: rg.taskId, limit: 10 });
  assert.equal(rgPage.ok, true);
  assert.ok(rgPage.items.some(item => item.path === 'src/alpha.js'));
  assert.ok(rgPage.items.some(item => item.path === 'src/beta.txt'));
  assert.ok(!rgPage.items.some(item => item.path.includes('node_modules')));
  const rgSummary = await call(config, { action: 'rgSummary', taskId: rg.taskId });
  assert.equal(rgSummary.ok, true);
  assert.ok(rgSummary.summary.matches >= 2);

  assert.equal(Priority.laneForAction('treeStart', 'fs'), Priority.LANES.P4);
  assert.equal(Priority.laneForAction('rgStart', 'fs'), Priority.LANES.P4);
  assert.equal(Priority.laneForAction('treePage', 'fs'), Priority.LANES.P0);
  assert.equal(Priority.laneForAction('rgCancel', 'fs'), Priority.LANES.P0);

  console.log(JSON.stringify({ ok: true, suite: 'scan-worker-tree-rg', treeTaskId: tree.taskId, rgTaskId: rg.taskId }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
