// B"H
const Lock = require('../lock/index.js');
function recover(config) { const lock = Lock.active(config); if (!lock) return { ok: true, action: 'missionDaemonRecover', recovered: false, reason: 'no_active_lock' }; lock.recoveredAt = new Date().toISOString(); Lock.set(config, lock); return { ok: true, action: 'missionDaemonRecover', recovered: true, lock, mustCallNext: lock.lastMustCallNext || { action: 'missionNext', missionId: lock.missionId } }; }
module.exports = { recover };
