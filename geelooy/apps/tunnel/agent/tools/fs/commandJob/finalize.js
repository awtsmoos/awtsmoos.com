// B"H
const WorkerProtocol = require('../../../lib/workers/worker-protocol.js');
const WorkerReceipts = require('../../../lib/workers/worker-receipts.js');

/**
 * B"H
 * Finalization binds the worker's last breath into its receipt.
 * The action name remains untouched; only state, output cost, and final pulse
 * are sealed into metadata for later trust.
 */
function finalizeMeta(meta = {}) {
  const state = meta.status || (meta.exitCode === 0 ? 'completed' : 'failed');
  meta.worker = WorkerProtocol.commandFinalWorker(meta.worker || {}, {
    state,
    exitCode: meta.exitCode,
    signal: meta.signal,
    finishedAt: meta.finishedAt,
    heartbeatAt: new Date().toISOString()
  });
  meta.receipt = WorkerReceipts.update(meta.receipt || {}, {
    state,
    exitCode: meta.exitCode,
    signal: meta.signal,
    safeToReplay: false
  });
  meta.cost = {
    ...(meta.cost || {}),
    wallMs: duration(meta.startedAt, meta.finishedAt),
    outputBytes: Number(meta.stdoutChars || 0) + Number(meta.stderrChars || 0)
  };
  return meta;
}

function duration(startedAt, finishedAt) {
  const start = Date.parse(startedAt || '');
  const finish = Date.parse(finishedAt || new Date().toISOString());
  if (!Number.isFinite(start) || !Number.isFinite(finish)) return 0;
  return Math.max(0, finish - start);
}

module.exports = { finalizeMeta, duration };
