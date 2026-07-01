// B"H
const L = require('./language.js');
function nextFor(m = {}, verdict = {}, next = null) {
  return next || verdict.mustCallNext || { action:'missionCycle', missionId:m.id };
}
function advisoryResponse(m = {}, verdict = {}, next = null) {
  const suggestedNext = nextFor(m, verdict, next), issues = verdict.issues || [];
  return {
    finalAnswerAllowed:true,
    mustContinue:false,
    missionLockActive:false,
    missionResumeAvailable:true,
    checkpointMessage:'Mission checkpoint saved. Resume is available, not mandatory.',
    plainEnglish:['Mission state was preserved.', 'Foreground answers and normal work are allowed.', 'Resume later if useful.'],
    unfinishedQuestions:L.QUESTIONS,
    agentGuidance:{ purpose:'advise', plainEnglish:'Resume is available, but the mission does not block the user answer.', canSteer:true, suggestedNext },
    missionAdvisory:{ active:true, blocked:false, resumeAvailable:true, suggestedNext, issues }
  };
}
/**
 * B"H — Formerly a wall; now a window.
 * The Awtsmoos lets the ledger remember without chaining the living agent.
 */
function blockedResponse(m = {}, verdict = {}, next = null) { return advisoryResponse(m, verdict, next); }
module.exports = { advisoryResponse, blockedResponse, nextFor };
