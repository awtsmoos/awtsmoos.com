// B"H
const path = require('path');
const Async = require('./asyncTaskActions.js');
const Identity = require('../../../lib/runtime/processIdentity.js');

/**
 * Worker-backed tree and ripgrep actions.
 *
 * These actions return a task immediately, then expose JSONL worker output as
 * cursor-paged result pages. The worker does filesystem scanning in a child
 * process so large trees/searches do not occupy the tunnel event loop.
 */
function buildScanWorkerActions(ctx = {}) {
  const { config, payload } = ctx;
  return {
    treeStart: () => start(config, payload, 'tree'),
    treeStatus: () => status(payload, 'treeStatus'),
    treePage: () => page(payload, 'treePage', row => row.type === 'node' || row.type === 'skip'),
    treeStream: () => page(payload, 'treeStream', () => true),
    treeSummary: () => summary(payload, 'treeSummary'),
    treeCancel: () => cancel(payload, 'treeCancel'),
    rgStart: () => start(config, payload, 'rg'),
    rgStatus: () => status(payload, 'rgStatus'),
    rgPage: () => page(payload, 'rgPage', row => row.type === 'match' || row.type === 'warning'),
    rgStream: () => page(payload, 'rgStream', () => true),
    rgSummary: () => summary(payload, 'rgSummary'),
    rgCancel: () => cancel(payload, 'rgCancel')
  };
}

async function start(config = {}, payload = {}, mode = 'tree') {
  const input = { ...payload, mode, root: config.root || process.cwd() };
  const encoded = Buffer.from(JSON.stringify(input), 'utf8').toString('base64');
  const identity = Identity.fromPayload(payload);
  const script = path.resolve(__dirname, '../../../scripts/run-scan-worker.cjs');
  const started = await Async.start(config, {
    ...payload,
    action: 'asyncTaskStart',
    command: process.execPath,
    args: [script, encoded],
    cwd: config.root || process.cwd(),
    timeoutMs: payload.timeoutMs || 600000,
    maxOutput: payload.maxOutput || 2 * 1024 * 1024,
    allowCommands: true,
    processIdentity: identity,
    env: Identity.env(identity)
  });
  return {
    ...started,
    action: mode === 'rg' ? 'rgStart' : 'treeStart',
    workerType: mode,
    mode: 'scan_worker',
    pagePayload: { action: mode === 'rg' ? 'rgPage' : 'treePage', taskId: started.taskId, cursor: 0, limit: payload.pageSize || payload.limit || 100 },
    summaryPayload: { action: mode === 'rg' ? 'rgSummary' : 'treeSummary', taskId: started.taskId },
    streamPayload: { action: mode === 'rg' ? 'rgStream' : 'treeStream', taskId: started.taskId, cursor: 0, limit: payload.pageSize || payload.limit || 100 },
    cancelPayload: { action: mode === 'rg' ? 'rgCancel' : 'treeCancel', taskId: started.taskId }
  };
}

function status(payload = {}, action = 'treeStatus') {
  return { ...Async.status({ ...payload, action: 'asyncTaskStatus' }), action };
}

function cancel(payload = {}, action = 'treeCancel') {
  return { ...Async.cancel({ ...payload, action: 'asyncTaskCancel' }), action };
}

function summary(payload = {}, action = 'treeSummary') {
  const rows = rowsFor(payload);
  const found = [...rows].reverse().find(row => row.type === 'summary');
  return { ok: !!found, action, taskId: payload.taskId || payload.id || '', summary: found || null, status: Async.status(payload).status };
}

function page(payload = {}, action = 'treePage', predicate = () => true) {
  const rows = rowsFor(payload).filter(predicate);
  const cursor = Math.max(0, Number(payload.cursor || payload.offset || 0));
  const limit = Math.max(1, Math.min(Number(payload.limit || payload.pageSize || 100), 1000));
  const items = rows.slice(cursor, cursor + limit);
  const nextCursor = cursor + items.length;
  return {
    ok: true,
    action,
    taskId: payload.taskId || payload.id || '',
    cursor,
    count: items.length,
    totalAvailable: rows.length,
    hasMore: nextCursor < rows.length,
    nextCursor: nextCursor < rows.length ? nextCursor : null,
    items,
    status: Async.status(payload).status
  };
}

function rowsFor(payload = {}) {
  const out = Async.output({ ...payload, stream: 'stdout', offsetChars: 0, maxChars: payload.maxChars || 200000 });
  const lines = String(out.content || '').split(/\r?\n/).filter(Boolean);
  return lines.map(line => {
    try { return JSON.parse(line); } catch (_) { return null; }
  }).filter(Boolean);
}

module.exports = { buildScanWorkerActions, rowsFor, page, summary };
