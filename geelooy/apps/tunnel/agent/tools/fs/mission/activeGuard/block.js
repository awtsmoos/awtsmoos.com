// B"H
function response(action, lock) { const next = lock.lastMustCallNext || { action: 'missionNext', missionId: lock.missionId, auto: true }; return { ok: false, action, error: 'mission_lock_blocks_unrelated_action', blockedAction: action, missionId: lock.missionId, releaseStatus: lock.releaseStatus || 'locked', finalAnswerAllowed: false, mustContinue: true, mustCallNext: next, responseFocus: { missionLocked: true, oneMainThing: 'A project mission lock is active. Call mustCallNext or a mission/status action.' } }; }
module.exports = { response };
