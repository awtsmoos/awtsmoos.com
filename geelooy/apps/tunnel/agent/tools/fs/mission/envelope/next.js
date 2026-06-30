// B"H
function next(lock = {}, result = {}, payload = {}) {
  return result.mustCallNext || result.nextRequiredAction || lock.lastMustCallNext || fallback(lock, payload);
}
function fallback(lock = {}, payload = {}) {
  return { action:'missionRoomSchedulerStatus', missionId:lock.missionId || payload.missionId, reason:'mission_lock_active_choose_next_work' };
}
/** B"H — The next action is a handle, not a chain. The agent may steer. */
module.exports = { next, fallback };
