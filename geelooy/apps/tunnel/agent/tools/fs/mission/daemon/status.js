// B"H
const Lock = require('../lock/index.js');
function status(config) { const lock = Lock.get(config); return { ok: true, action: 'missionDaemonStatus', active: !!(lock && lock.releaseAllowed !== true), lock, finalAnswerAllowed: false, mustContinue: !!(lock && lock.releaseAllowed !== true), mustCallNext: lock?.lastMustCallNext || null }; }
module.exports = { status };
