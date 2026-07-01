// B"H
const Paths = require('./paths.js');
const WorkerProtocol = require('../../../lib/workers/worker-protocol.js');
const WorkerReceipts = require('../../../lib/workers/worker-receipts.js');

/**
 * B"H
 * The metadata is the scroll placed beside the worker before it enters exile:
 * command, cwd, shell, receipt, cost, and original action name are written
 * first so even a crash leaves a truthful trail.
 */
function createMeta({ jobId, command, cwd, shell, timeoutMs, config, payload = {}, ids = {} }) {
  const startedAt = new Date().toISOString();
  const requestAction = String(payload.requestAction || payload.originalAction || payload.action || 'commandStart');
  const actualAction = String(payload.actualAction || 'commandStart');
  return {
    BH: 'B"H',
    jobId,
    action: 'commandStart',
    requestAction,
    actualAction,
    command,
    cwd,
    shell,
    startedAt,
    status: 'running',
    exitCode: null,
    signal: null,
    timedOut: false,
    stdoutChars: 0,
    stderrChars: 0,
    timeoutMs,
    workerId: ids.workerId,
    receiptId: ids.receiptId,
    worker: workerFor(ids.workerId, jobId, null, timeoutMs, startedAt),
    receipt: receiptFor(ids, jobId, requestAction, actualAction, payload, startedAt),
    cost: costStart(timeoutMs, payload),
    storage: { backend: 'device-file', outsideProject: true, folder: Paths.jobDir(config, jobId) }
  };
}

function attachPid(meta, pid) {
  meta.worker = workerFor(meta.workerId, meta.jobId, pid, meta.timeoutMs, meta.startedAt);
  return meta;
}

function workerFor(workerId, jobId, pid, timeoutMs, startedAt) {
  return WorkerProtocol.commandWorker({ workerId, jobId, pid, state: 'running', timeoutMs, startedAt, heartbeatAt: startedAt });
}

function receiptFor(ids, jobId, requestAction, actualAction, payload, startedAt) {
  return WorkerReceipts.commandReceipt({ receiptId: ids.receiptId, jobId, workerId: ids.workerId, action: 'commandStart', requestAction, actualAction, missionId: payload.missionId || '', state: 'running', createdAt: startedAt });
}

function costStart(timeoutMs, payload = {}) {
  return { units: 1, wallMs: 0, outputBytes: 0, riskClass: 'long_running_command', timeoutMs, agentLeaseId: payload.agentLeaseId || '', missionId: payload.missionId || '' };
}

module.exports = { createMeta, attachPid, costStart };
