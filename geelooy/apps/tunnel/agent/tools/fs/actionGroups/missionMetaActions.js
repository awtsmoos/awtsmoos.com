// B"H
const Lock = require('../mission/lock/index.js'); const Oath = require('../mission/oath/index.js'); const Snapshot = require('../mission/snapshot/index.js'); const Deadman = require('../mission/deadman/index.js'); const Takeover = require('../mission/takeover/index.js'); const StopAudit = require('../mission/stopAudit/index.js');
function buildMissionMetaActions(ctx) { const { config, payload } = ctx; return {
  async missionOathAccept() { const lock = Lock.active(config); return lock ? { ok:true, action:'missionOathAccept', oath:Oath.accept(config, lock, payload) } : { ok:false, action:'missionOathAccept', error:'no_active_lock' }; },
  async missionSnapshotTake() { const lock = Lock.active(config); return lock ? { ok:true, action:'missionSnapshotTake', snapshot:Snapshot.take(config, lock, payload.reason || 'manual') } : { ok:false, action:'missionSnapshotTake', error:'no_active_lock' }; },
  async missionDeadmanStatus() { const lock = Lock.active(config); return { ok:true, action:'missionDeadmanStatus', stale:!!(lock && Deadman.stale(lock, payload.staleMs)), mustCallNext: lock && Deadman.stale(lock, payload.staleMs) ? Deadman.recoverNext(lock) : null }; },
  async missionTakeoverClaim() { const lock = Lock.active(config); if (!lock) return { ok:false, action:'missionTakeoverClaim', error:'no_active_lock' }; Lock.set(config, Takeover.claim(lock, payload.agentId || 'anonymous')); return { ok:true, action:'missionTakeoverClaim', owner:payload.agentId || 'anonymous' }; },
  async missionStopAuditList() { return { ok:true, action:'missionStopAuditList', attempts:StopAudit.list(config) }; }
}; }
module.exports = { buildMissionMetaActions };
