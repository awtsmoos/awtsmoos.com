// B"H
const Lock = require('../lock/index.js');
function status(config) {
  const lock = Lock.get(config);
  const active = !!(lock && lock.releaseAllowed !== true);
  const nextSuggestedToolCall = active ? lock?.lastMustCallNext || null : null;
  return {
    ok: true,
    action: 'missionDaemonStatus',
    active,
    lock,
    finalAnswerAllowed: true,
    mustContinue: false,
    nextSuggestedToolCall,
    missionAdvisory: active ? { active:true, blocked:false, resumeAvailable:true, suggestedNext:nextSuggestedToolCall, missionId:lock.missionId || null } : { active:false, blocked:false, resumeAvailable:false }
  };
}
module.exports = { status };
