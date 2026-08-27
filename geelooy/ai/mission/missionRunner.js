// B"H
const { makeMission } = require("./state");
const { addEvidence } = require("./evidenceLedger");
const { addWorkNode } = require("./workGraph");
const { addRemainingWork, completeRemainingWork } = require("./missionLedger");
const { generateSelfQuestions, answerSelfQuestions } = require("./questionEngine");
const { reviewMission } = require("./selfReview");
const { evaluateCompletionGate, requireNextAction } = require("./continuationGate");
const { writeCheckpoint } = require("./checkpointStore");
const { writeHandoff } = require("./handoffWriter");
const { interrogateCompletion } = require("./multipleChoice");
const { discoverShadowWork } = require("./shadowWork");
function createMission(input = {}) { let m = makeMission(input); m = addWorkNode(m, { title: m.title, purpose: m.goal, verification: ["completion gate passes"] }); m = addEvidence(m, { kind: "user", source: "createMission", summary: "Mission initialized from caller input" }); m = generateSelfQuestions(m); m = answerSelfQuestions(m); return requireNextAction(m); }
function advanceMission(mission, event = {}) { let m = addEvidence(mission, { kind: event.kind || "runtime", source: event.source || "advanceMission", summary: event.summary || "Mission advanced" }); if (event.completedWork) m = completeRemainingWork(m, event.completedWork); if (event.remainingWork) m = addRemainingWork(m, event.remainingWork); if (event.shadowWork !== false) m = discoverShadowWork(m, event); return requireNextAction(m); }
function checkpointMission(mission, options = {}) { return writeCheckpoint(mission, options.dir); }
function shouldContinue(mission) { return !evaluateCompletionGate(mission).ok; }
function finalizeSlice(mission, options = {}) { let m = reviewMission(mission); m = interrogateCompletion(m); m = requireNextAction(m); m = writeHandoff(m, options.dir); m = writeCheckpoint(m, options.dir); return m; }
module.exports = { createMission, advanceMission, reviewMission, checkpointMission, shouldContinue, finalizeSlice };
