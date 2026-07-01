// B"H
function commandWorker({ workerId, jobId, pid, state = 'running', timeoutMs, startedAt, heartbeatAt } = {}) {
  return clean({
    workerId,
    jobId,
    kind: 'subprocess',
    state,
    pid: Number.isFinite(Number(pid)) ? Number(pid) : null,
    isolation: 'stdio-stream-files',
    timeoutMs: Number.isFinite(Number(timeoutMs)) ? Number(timeoutMs) : null,
    startedAt,
    heartbeatAt
  });
}
function commandFinalWorker(worker = {}, patch = {}) {
  return clean({
    ...worker,
    state: patch.state || worker.state || 'completed',
    heartbeatAt: patch.heartbeatAt || new Date().toISOString(),
    finishedAt: patch.finishedAt || new Date().toISOString(),
    exitCode: patch.exitCode ?? worker.exitCode ?? null,
    signal: patch.signal || worker.signal || null
  });
}
function evidenceFor(worker = {}, receipt = {}) {
  const evidence = ['identity_preserved'];
  if (receipt.receiptId) evidence.push('receipt_written');
  if (worker.pid) evidence.push('process_spawned');
  if (worker.kind === 'subprocess') evidence.push('subprocess_isolation');
  return evidence;
}
function clean(obj) {
  for (const key of Object.keys(obj)) if (obj[key] === undefined) delete obj[key];
  return obj;
}
module.exports = { commandWorker, commandFinalWorker, evidenceFor };
