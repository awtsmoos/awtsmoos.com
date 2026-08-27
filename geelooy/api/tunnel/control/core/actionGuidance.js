// B"H

const { armProtocolGate } = require("./protocolGateStore.js");
const { isPassiveAction } = require("./protocolGatePolicy.js");

const DEFAULT_KEEP_GOING_PROMPT = "B - continue with the next verified action.";
const DEFAULT_CONCLUDE_PROMPT = "A - complete only if all gates pass.";

/**
 * B"H
 * Chapter 816 repaired fully: guidance is not steering. Passive transport,
 * command, filesystem, and diagnostic actions must return proof and then become
 * quiet. Mission actions may still ask whether the mission is complete. The
 * response may inspire the AI, but no field here may become the next tool call
 * unless the caller explicitly chooses it.
 */
function debugWanted(payload = {}) {
  return payload.guidanceDebug === true || payload.guidanceDebug === "true" || payload.debugGuidance === true || payload.debugGuidance === "true";
}

function actionName(result = {}, payload = {}) {
  return String(payload.action || result.action || "unknown");
}

function resultDone(result = {}, payload = {}) {
  const action = actionName(result, payload);
  if (result.finalAnswerAllowed === true || result.done === true || result.ok === false) return true;
  if (isPassiveAction(action)) return true;
  if (result.status && result.status !== "running" && isPassiveAction(action)) return true;
  return false;
}

function missionIdOf(result = {}, payload = {}) {
  return result.missionId || result.mission?.id || result.report?.id || payload.missionId || payload.id || "";
}

function actionNeedsRoom(action = "") {
  return /^mission(Agent|Room|Step|Loop|Next|Claim|Delegate|Audit|Sync|Answer|Thaw|Refrigerate)/.test(String(action || ""));
}

function nextAction(result = {}, payload = {}, action = "") {
  if (result.mustCallNext && typeof result.mustCallNext === "object") return result.mustCallNext;
  const missionId = missionIdOf(result, payload);
  if (!missionId && actionNeedsRoom(action)) return { action: "missionProjectDiscover", projectRoot: payload.projectRoot || payload.root || payload.cwd || ".", agentId: payload.agentId || payload.logicalAgentId || "agent" };
  if (missionId && /^mission/.test(String(action))) return { action: "missionAgentSync", missionId, agentId: payload.agentId || payload.logicalAgentId || "agent", blockOnUserMessage: true };
  return { action: "finishAndContinue", continuationPrompt: DEFAULT_KEEP_GOING_PROMPT };
}

function publicQuestion() {
  return {
    id: `forced_${Date.now()}`,
    text: "BEFORE YOU GO ON FIRST ANSWER THIS: IS THIS MISSION COMPLETE?",
    choices: ["B - continue with proof"],
    expectedAnswerFormat: "B plus proof unless you truly have A/C/D blocker proof.",
    requiredChoiceWhenWorkRemains: "B"
  };
}

function protocolFor(result = {}, payload = {}) {
  const action = actionName(result, payload);
  const keepGoing = !resultDone(result, payload);
  const gate = keepGoing ? { required: true, requiredChoice: "B", requiredText: "continue with proof", question: "IS THIS MISSION COMPLETE?", publicQuestion: publicQuestion() } : null;
  return {
    finalAnswerAllowed: !keepGoing,
    mustContinue: keepGoing,
    mustCallNext: keepGoing ? nextAction(result, payload, action) : null,
    multipleChoiceSelfInterrogation: gate?.publicQuestion || null,
    responseFocus: focus(action, result, payload, keepGoing),
    protocolGate: gate
  };
}

function focus(action, result, payload, keepGoing) {
  if (!keepGoing) return { action, oneMainThing: "Conclude only after stating what passed and what remains.", mustAnswerGate: false, nextAction: null };
  const next = nextAction(result, payload, action);
  return { action, oneMainThing: "BEFORE YOU GO ON FIRST ANSWER THE MULTIPLE CHOICE: B - CONTINUE WITH PROOF.", mustAnswerGate: true, nextAction: next };
}

function attachActionGuidance(result, payload = {}) {
  if (!result || typeof result !== "object" || Array.isArray(result)) return result;
  const protocol = protocolFor(result, payload);
  if (protocol.protocolGate) armProtocolGate(payload, protocol.protocolGate);
  const compact = {
    ...result,
    finalAnswerAllowed: protocol.finalAnswerAllowed,
    mustContinue: protocol.mustContinue,
    mustCallNext: protocol.mustCallNext,
    responseFocus: protocol.responseFocus,
    awtsmoosNext: protocol.responseFocus,
    stopRule: protocol.mustContinue ? "BEFORE YOU GO ON FIRST ANSWER THE MULTIPLE CHOICE." : "No forced multiple-choice pending."
  };
  if (protocol.multipleChoiceSelfInterrogation) compact.multipleChoiceSelfInterrogation = protocol.multipleChoiceSelfInterrogation;
  if (!debugWanted(payload)) return compact;
  return { ...compact, aiGuidance: { keepGoing: protocol.mustContinue, prompt: protocol.responseFocus.oneMainThing, responseFocus: protocol.responseFocus, keepGoingPrompt: DEFAULT_KEEP_GOING_PROMPT, concludePrompt: DEFAULT_CONCLUDE_PROMPT } };
}

module.exports = { DEFAULT_KEEP_GOING_PROMPT, DEFAULT_CONCLUDE_PROMPT, attachActionGuidance, protocolFor, resultDone, isPassiveAction };
