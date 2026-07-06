// B"H
const Lock = require('../lock/index.js');
function status(config) {
  const lock = Lock.active(config);
  const nextSuggestedToolCall = lock?.lastMustCallNext || null;
  return {
    ok: true,
    action: 'missionWatchdogStatus',
    active: !!lock,
    lock,
    mustContinue: false,
    finalAnswerAllowed: true,
    nextSuggestedToolCall,
    missionAdvisory: lock ? { active:true, blocked:false, resumeAvailable:true, suggestedNext:nextSuggestedToolCall, missionId:lock.missionId || null } : { active:false, blocked:false, resumeAvailable:false }
  };
}
module.exports = { status };
