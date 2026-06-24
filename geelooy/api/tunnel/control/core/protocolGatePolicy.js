// B"H

const POLL_ACTIONS = new Set(["commandWait", "commandStatus", "commandJobOutputPage", "commandOutputPage"]);
const ANSWER_ACTIONS = new Set(["finishAndContinue", "missionAgentRespond", "missionRoomUserMessage"]);
const PASSIVE_ACTIONS = new Set([
  "command", "commandRun", "commandStart", "commandStatus", "commandWait", "commandJobOutputPage", "commandOutputPage", "commandPoll", "commandJobStatus", "commandJobWait", "commandCancel", "commandJobCancel",
  "list", "tree", "read", "readLines", "readManyLines", "readBytes", "read64", "md", "stat", "grep", "rg", "rgbgrep", "find", "findFiles", "selectString", "selectStringFile",
  "bulk", "bulkSearch", "bulkSearchPage", "fileHashes", "recentFiles", "largeFiles", "duplicateBasenames", "textStats", "projectOverview", "configGet", "roots", "rootBrowse",
  "payloadEcho", "actionSchemaTrace", "payloadShapeInfer", "actionAliasResolver", "agentDoctor", "agentSelfTest", "tunnelDoctor", "tunnelLivenessTimeline"
]);

/**
 * B"H
 * Chapter 821 repaired: the gate may halt a mission-room answer, but it may not
 * seize the filesystem steering wheel. Many agents can poll, read, page logs,
 * and inspect schemas at the same time; a stale completion question from one
 * shliach must never turn another shliach's explicit command into list,
 * configGet, agentDoctor, or silence. The Awtsmoos is exact; the gate is a
 * question, not an action router.
 */
function actionAllowedWhilePending(payload = {}, gate = {}) {
  if (answerFromPayload(payload)) return { ok: true, reason: "answered_gate" };
  if (ANSWER_ACTIONS.has(payload.action)) return { ok: true, reason: "answer_action" };
  if (isPassiveAction(payload.action)) return { ok: true, reason: "passive_action_never_blocked" };
  if (POLL_ACTIONS.has(payload.action) && (!gate.jobId || payload.jobId === gate.jobId)) return { ok: true, reason: "same_job_poll" };
  return { ok: false, reason: "must_answer_multiple_choice_first" };
}

function isPassiveAction(action = "") {
  const text = String(action || "");
  if (PASSIVE_ACTIONS.has(text)) return true;
  if (/^(preview|browser|chrome|http|weather|finance|sports|time)/.test(text)) return true;
  if (/^(nodeCheck|syntaxCheck|testRunner|lintRunner|typecheckRunner|buildRunner)/.test(text)) return true;
  return false;
}

function answerFromPayload(payload = {}) {
  const raw = payload.multipleChoiceAnswer || payload.choice || payload.answer || payload.continuationPrompt || payload.message || payload.text || "";
  const match = String(raw).trim().match(/^([ABCD])\b/i);
  return match ? match[1].toUpperCase() : "";
}

function blockerProofOk(choice, payload = {}) {
  if (!choice || choice === "B") return true;
  if (choice === "A") return Boolean(payload.finalVerification || payload.evidence || payload.testsRun);
  return Boolean(payload.safeActionsTried && payload.whyUserNeeded && payload.nextIfApproved);
}

module.exports = { actionAllowedWhilePending, answerFromPayload, blockerProofOk, isPassiveAction };
