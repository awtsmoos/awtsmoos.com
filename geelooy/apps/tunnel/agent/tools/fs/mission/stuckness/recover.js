// B"H
function next(lock = {}) { return { action: 'missionRepeatBetter', missionId: lock.missionId, reason: 'stuck_must_call_next_repeated' }; }
module.exports = { next };
