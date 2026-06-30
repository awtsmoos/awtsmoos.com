// B"H
const L = require('./language.js');
function nextFor(m = {}, verdict = {}, next = null) {
  return next || verdict.mustCallNext || { action: 'missionCycle', missionId: m.id };
}
/**
 * B"H — The blocked response is firm but kind.
 * It protects the mission lock while telling the AI it may steer, recover, or
 * continue thoughtfully instead of feeling scolded by the tunnel.
 */
function blockedResponse(m = {}, verdict = {}, next = null) {
  const mustCallNext = nextFor(m, verdict, next), issues = verdict.issues || [];
  return { finalAnswerAllowed:false, mustContinue:true, missionLockActive:true,
    checkpointMessage:L.checkpointMessage(), plainEnglish:L.GUIDANCE,
    unfinishedQuestions:L.QUESTIONS, tunnelInstruction:L.instruction(mustCallNext, issues),
    agentGuidance:{ purpose:'continue', plainEnglish:L.instruction(mustCallNext, issues), canSteer:true, emergencyStopPolicy:'Only extreme safety/tool/testing cases may stop without user release.' },
    mustCallNext };
}
module.exports = { blockedResponse, nextFor };
