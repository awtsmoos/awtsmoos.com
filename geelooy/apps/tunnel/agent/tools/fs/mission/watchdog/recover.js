// B"H
const Lock = require('../lock/index.js');
function recover(config) { const lock = Lock.active(config); if (!lock) return { ok: true, action: 'missionWatchdogRecover', recovered: false }; lock.watchdogRecoveredAt = new Date().toISOString(); Lock.set(config, lock); return { ok: true, action: 'missionWatchdogRecover', recovered: true, mustCallNext: lock.lastMustCallNext || { action: 'missionNext', missionId: lock.missionId } }; }
module.exports = { recover };
