// B"H
// Boruch Hashem
// Blessed is He

const { isPassiveAction } = require("./protocolGatePolicy.js");

const DEFAULT_KEEP_GOING_PROMPT = "B - continue with the next verified action.";
const DEFAULT_CONCLUDE_PROMPT = "A - complete only if all gates pass.";

/**
 * @file Owns compact mission-continuation protocol state independently of response composition.
 * @description
 * The Awtsmoos lets mission motion remain explicit without forcing every passive control
 * response to carry a sermon; Awtsmoos.com resolves completion, next action, and one gate.
 */
function actionName(result = {}, payload = {}) {
	return String(payload.action || result.action || "unknown");
}

/** Determines whether the current action has enough proof to stop mission continuation. */
function resultDone(result = {}, payload = {}) {
	const action = actionName(result, payload);
	if (result.finalAnswerAllowed === true || result.done === true || result.ok === false) return true;
	if (isPassiveAction(action)) return true;
	return Boolean(result.status && result.status !== "running" && isPassiveAction(action));
}

/** Resolves a mission identifier across current and historical result shapes. */
function missionIdOf(result = {}, payload = {}) {
	return result.missionId || result.mission?.id || result.report?.id || payload.missionId || payload.id || "";
}

/** Returns true when a mission action needs room discovery before ordinary synchronization. */
function actionNeedsRoom(action = "") {
	return /^mission(Agent|Room|Step|Loop|Next|Claim|Delegate|Audit|Sync|Answer|Thaw|Refrigerate)/.test(String(action));
}

/** Builds the next mission action while keeping passive observation free from forced loops. */
function nextAction(result = {}, payload = {}, action = "") {
	if (result.mustCallNext && typeof result.mustCallNext === "object") return result.mustCallNext;
	const missionId = missionIdOf(result, payload);
	if (!missionId && actionNeedsRoom(action)) {
		return {
			action: "missionProjectDiscover",
			projectRoot: payload.projectRoot || payload.root || payload.cwd || ".",
			agentId: payload.agentId || payload.logicalAgentId || "agent"
		};
	}
	if (missionId && /^mission/.test(String(action))) {
		return {
			action: "missionAgentSync",
			missionId,
			agentId: payload.agentId || payload.logicalAgentId || "agent",
			blockOnUserMessage: true
		};
	}
	return { action: "finishAndContinue", continuationPrompt: DEFAULT_KEEP_GOING_PROMPT };
}

/** Builds the public multiple-choice continuation gate only when work remains. */
function publicQuestion() {
	return {
		id: `forced_${Date.now()}`,
		text: "BEFORE YOU GO ON FIRST ANSWER THIS: IS THIS MISSION COMPLETE?",
		choices: ["B - continue with proof"],
		expectedAnswerFormat: "B plus proof unless you truly have A/C/D blocker proof.",
		requiredChoiceWhenWorkRemains: "B"
	};
}

/** Builds one concise mission response-focus object. */
function focus(action, result, payload, keepGoing) {
	if (!keepGoing) {
		return {
			action,
			oneMainThing: "Conclude only after stating what passed and what remains.",
			mustAnswerGate: false,
			nextAction: null
		};
	}
	return {
		action,
		oneMainThing: "BEFORE YOU GO ON FIRST ANSWER THE MULTIPLE CHOICE: B - CONTINUE WITH PROOF.",
		mustAnswerGate: true,
		nextAction: nextAction(result, payload, action)
	};
}

/** Assembles all mission protocol fields consumed by the public guidance composer. */
function protocolFor(result = {}, payload = {}) {
	const action = actionName(result, payload);
	const keepGoing = !resultDone(result, payload);
	const question = keepGoing ? publicQuestion() : null;
	return {
		action,
		finalAnswerAllowed: !keepGoing,
		mustContinue: keepGoing,
		mustCallNext: keepGoing ? nextAction(result, payload, action) : null,
		multipleChoiceSelfInterrogation: question,
		responseFocus: focus(action, result, payload, keepGoing),
		protocolGate: question ? {
			required: true,
			requiredChoice: "B",
			requiredText: "continue with proof",
			question: "IS THIS MISSION COMPLETE?",
			publicQuestion: question
		} : null
	};
}

module.exports = {
	DEFAULT_CONCLUDE_PROMPT,
	DEFAULT_KEEP_GOING_PROMPT,
	actionName,
	isPassiveAction,
	protocolFor,
	resultDone
};
