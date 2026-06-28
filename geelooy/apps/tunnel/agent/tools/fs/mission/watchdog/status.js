// B"H
const Lock = require('../lock/index.js');
function status(config) { const lock = Lock.active(config); return { ok: true, action: 'missionWatchdogStatus', active: !!lock, lock, mustContinue: !!lock, finalAnswerAllowed: false, mustCallNext: lock?.lastMustCallNext || null }; }
module.exports = { status };
