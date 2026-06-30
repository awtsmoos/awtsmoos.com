// B"H
function ensure(lock = {}, result = {}, next = null) {
  if (!lock?.missionId) return result;
  const guidance = result.agentGuidance || { plainEnglish:result.tunnelInstruction || '', canSteer:true };
  return { ...result, missionHeartbeat:{ missionId:lock.missionId, missionLockActive:true,
    mustCallNext:next || result.mustCallNext || lock.lastMustCallNext || null,
    agentGuidance:guidance, at:new Date().toISOString() } };
}
/** B"H — A mission heartbeat makes silence visible before it becomes drift. */
module.exports = { ensure };
