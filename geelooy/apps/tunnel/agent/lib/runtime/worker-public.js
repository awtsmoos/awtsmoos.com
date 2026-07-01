// B"H
/**
 * B"H
 * Chapter of the visible breath:
 * the Awtsmoos does not ask the tunnel to believe in hidden workers.
 * Every worker that descends into a subprocess mine must return as a clean
 * public shape: its name, its pulse, its receipt, and the action it serves.
 */
function publicWorker(record = {}, at = Date.now()) {
  const heartbeatAt = Date.parse(record.heartbeatAt || '');
  return clean({
    workerId: record.workerId,
    jobId: record.jobId,
    action: record.action,
    actualAction: record.actualAction,
    kind: record.kind,
    state: record.state,
    pid: record.pid || null,
    startedAt: record.startedAt,
    heartbeatAt: record.heartbeatAt,
    heartbeatAgeMs: Number.isFinite(heartbeatAt) ? Math.max(0, at - heartbeatAt) : null,
    receiptId: record.receiptId,
    missionId: record.missionId,
    riskClass: record.riskClass,
    cancelable: record.cancelable,
    exitCode: record.exitCode,
    signal: record.signal,
    finishedAt: record.finishedAt
  });
}

/** Render one supervised helper process without leaking child objects. */
function publicProcess(record = {}) {
  return clean({
    name: record.name,
    status: record.status,
    pid: record.pid || null,
    restartCount: record.restartCount || 0,
    startedAt: record.startedAt || null,
    lastSeenAt: record.lastSeenAt || null,
    exitCode: record.exitCode ?? null,
    signal: record.signal || null,
    error: record.error || null
  });
}

function clean(object) {
  for (const key of Object.keys(object)) {
    if (object[key] === undefined || object[key] === '') delete object[key];
  }
  return object;
}

module.exports = { publicWorker, publicProcess, clean };
