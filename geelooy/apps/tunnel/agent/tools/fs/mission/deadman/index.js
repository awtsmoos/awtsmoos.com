// B"H
function stale(lock = {}, ms = 180000) { const at = Date.parse(lock.updatedAt || lock.startedAt || 0); return !!at && Date.now() - at > ms; }
function recoverNext(lock = {}) { return { action:'missionWatchdogRecover', missionId:lock.missionId, reason:'deadman_stale_heartbeat' }; }
module.exports = { stale, recoverNext };
