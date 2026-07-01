// B"H
function goal(payload = {}) {
  const action = payload.action || 'tool work';
  return String(payload.goal || payload.prompt || payload.query || `Continue user-requested tunnel work for ${action}`);
}
function next(missionId) { return { action:'missionRoomSchedulerStatus', missionId, reason:'implicit_mission_boot_choose_next_work' }; }
function message(payload = {}) {
  return `I started a mission context for ${payload.action || 'this work'} so the tunnel can track the next useful step. You can steer it at any time; it continues until explicit user stop or safety block.`;
}
/** B"H — Implicit mission boot is a helpful seatbelt, not a cage. */
module.exports = { goal, message, next };
