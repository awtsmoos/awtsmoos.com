// B"H

const POLL_ACTIONS = new Set(["commandWait", "commandStatus", "commandJobOutputPage", "commandOutputPage"]);
const ANSWER_ACTIONS = new Set(["finishAndContinue", "missionAgentRespond", "missionRoomUserMessage"]);

/**
 * B"H
 * Chapter 821: The gate stopped being a poem and became a locked door.
 */
function actionAllowedWhilePending(payload = {}, gate = {}) {
  if (answerFromPayload(payload)) return { ok: true, reason: "answered_gate" };
  if (ANSWER_ACTIONS.has(payload.action)) return { ok: true, reason: "answer_action" };
  if (POLL_ACTIONS.has(payload.action) && (!gate.jobId || payload.jobId === gate.jobId)) return { ok: true, reason: "same_job_poll" };
  return { ok: false, reason: "must_answer_multiple_choice_first" };
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

module.exports = { actionAllowedWhilePending, answerFromPayload, blockerProofOk };
