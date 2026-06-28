// B"H
function boot(lock = {}, reason = 'mission_lock_recovery') {
  return { action: 'missionBootResume', missionId: lock.missionId || '', autoMission: true, tick: true, reason };
}
function repeat(lock = {}) {
  return { action: 'missionRepeatBetter', missionId: lock.missionId || '', reason: 'stuck_must_call_next_repeated' };
}
function next(lock = {}, detected = {}) {
  if (detected.staleMission || detected.missingMission || !lock.missionId) return boot(lock, 'stale_or_missing_mission_reference');
  if (Number(detected.count || lock.repeatCount || 0) >= 5) return boot(lock, 'repeat_loop_needs_boot_resume');
  return repeat(lock);
}
module.exports = { next, boot, repeat };
