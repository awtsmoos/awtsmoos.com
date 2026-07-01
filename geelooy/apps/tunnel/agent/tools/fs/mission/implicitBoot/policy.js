// B"H
const READ_ONLY = new Set([
  'read','read64','readLines','readManyLines','grep','findFiles','tree','list','stat',
  'gitStatusDeep','commandStatus','commandWait','commandJobOutputPage','previewList',
  'previewSettingsGet','configGet','time','weather'
]);
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'yes'; }
function optedOut(payload = {}) { return truthy(payload.noMission) || truthy(payload.disableMission) || truthy(payload.missionless); }
function optedIn(payload = {}) {
  return truthy(payload.autoMission) || truthy(payload.mission) || truthy(payload.enableMission) || process.env.AWTSMOOS_AUTO_MISSION === '1';
}
function shouldBoot(payload = {}) {
  const action = String(payload.action || '');
  if (!action || optedOut(payload) || READ_ONLY.has(action) || action.startsWith('mission')) return false;
  return optedIn(payload);
}
function reason(payload = {}) { return shouldBoot(payload) ? 'explicit_mission_opt_in' : 'mission_advisory_only'; }
/**
 * B"H — The vessel no longer drags every hammer into court.
 * Ordinary work may blaze forward; only an explicit mission request wakes the
 * durable scribe, who records softly and never seizes the king's mouth.
 */
module.exports = { READ_ONLY, optedIn, optedOut, reason, shouldBoot, truthy };
