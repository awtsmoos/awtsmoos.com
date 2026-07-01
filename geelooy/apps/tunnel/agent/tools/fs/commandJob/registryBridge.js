// B"H
/**
 * B"H
 * The bridge between command metadata and the global worker ledger.
 * It carries no shell power. It only translates a job into a visible worker
 * record so queueStats can tell the truth while work is still alive.
 */
function registryRecord(meta = {}, pid = null) {
  return {
    workerId: meta.workerId,
    jobId: meta.jobId,
    action: meta.requestAction || meta.action,
    actualAction: meta.actualAction,
    kind: 'subprocess',
    state: meta.status,
    pid,
    startedAt: meta.startedAt,
    heartbeatAt: meta.worker?.heartbeatAt || meta.startedAt,
    receiptId: meta.receiptId,
    missionId: meta.cost?.missionId || '',
    riskClass: 'long_running_command',
    cancelable: true
  };
}

function finishRegistry(registry, meta = {}) {
  if (!registry || !meta.workerId) return null;
  const patch = {
    state: meta.status,
    exitCode: meta.exitCode,
    signal: meta.signal,
    heartbeatAt: meta.worker?.heartbeatAt,
    finishedAt: meta.finishedAt
  };
  if (meta.status === 'cancelled') return registry.cancelWorker(meta.workerId, patch);
  return registry.finishWorker(meta.workerId, patch);
}

module.exports = { registryRecord, finishRegistry };
