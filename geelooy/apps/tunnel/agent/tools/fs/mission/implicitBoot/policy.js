// B"H
const MUTATING = ['write','bulkWrite','delete','move','copy','mkdir','touch','apply','replace','insert','commandRun','commandStart','server','previewExposeLocalServer','chrome','browser','git','build','test','npm'];
const READ_ONLY = new Set(['read','read64','readLines','readManyLines','grep','findFiles','tree','list','stat','gitStatusDeep','commandStatus','commandWait','commandJobOutputPage','previewList','previewSettingsGet','configGet','time','weather']);
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'yes'; }
function optedOut(payload = {}) { return truthy(payload.noMission) || truthy(payload.disableMission) || truthy(payload.missionless); }
function shouldBoot(payload = {}) {
  const action = String(payload.action || '');
  if (!action || optedOut(payload) || READ_ONLY.has(action) || action.startsWith('mission')) return false;
  return MUTATING.some(x => action === x || action.startsWith(x));
}
function reason(payload = {}) { return shouldBoot(payload) ? 'meaningful_tool_work_requires_mission' : 'mission_not_required'; }
module.exports = { MUTATING, READ_ONLY, optedOut, reason, shouldBoot, truthy };
