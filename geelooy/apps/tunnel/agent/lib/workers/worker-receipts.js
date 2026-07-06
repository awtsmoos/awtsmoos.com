// B"H
function commandReceipt({
  receiptId, jobId, workerId, action = 'commandStart', requestAction, actualAction,
  missionId = '', roomId = '', agentSessionId = '', logicalAgentId = '',
  conversationId = '', conversationName = '', leaseId = '', agentLeaseId = '',
  state = 'running', createdAt, safeToReplay = false
} = {}) {
  return clean({
    receiptId,
    jobId,
    workerId,
    action,
    requestAction: requestAction || action,
    actualAction: actualAction || action,
    missionId,
    roomId,
    agentSessionId,
    logicalAgentId,
    conversationId,
    conversationName,
    leaseId: leaseId || agentLeaseId,
    state,
    createdAt: createdAt || new Date().toISOString(),
    safeToReplay: safeToReplay === true
  });
}
function update(receipt = {}, patch = {}) {
  return clean({ ...receipt, ...patch, updatedAt: patch.updatedAt || new Date().toISOString() });
}
function clean(obj) {
  for (const key of Object.keys(obj)) if (obj[key] === undefined || obj[key] === '') delete obj[key];
  return obj;
}
module.exports = { commandReceipt, update };
