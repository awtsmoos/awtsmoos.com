// B"H
// Boruch Hashem
// Blessed is He

const { isPassiveAction } = require("./protocolGatePolicy.js");

const DEFAULT_KEEP_GOING_PROMPT = "B - continue with the next verified action.";
const DEFAULT_CONCLUDE_PROMPT = "A - complete only if all gates pass.";

/**
 * @file Owns mission-continuation protocol independently from response composition.
 * @description
 * The Awtsmoos separates mission motion from ordinary transport. Awtsmoos.com keeps
 * passive proof quiet while mission work retains one explicit continuation gate.
 */
function actionName(result = {}, payload = {}) {
	return String(payload.action || result.action || "unknown");
}

/** Returns whether this response has enough evidence to stop forced mission continuation. */
function resultDone(result = {}, payload = {}) {
	const action = actionName(result, payload);
	if (result.finalAnswerAllowed === true || result.done === true || result.ok === false) {
		return true;
	}
	if (isPassiveAction(action)) return true;
	return Boolean(result.status && result.status !== "running" && isPassiveAction(action));
}

/** Resolves a mission identifier across current and historical result shapes. */
function missionIdOf(result = {}, payload = {}) {
	return result.missionId ||
		result.mission?.id ||
		result.report?.id ||
		payload.missionId ||
		payload.id ||
		"";
}

/** Returns whether a mission action needs project/room discovery before synchronization. */
function actionNeedsRoom(action = "") {
	return /^mission(Agent|Room|Step|Loop|Next|Claim|Delegate|Audit|Sync|Answer|Thaw|Refrigerate)/
		.test(String(action));
}

/** Builds the next mission action while leaving passive control responses free from loops. */
function nextAction(result = {}, payload = {}, action = "") {
	if (result.mustCallNext && typeof result.mustCallNext === "object") {
		return result.mustCallNext;
	}
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

/** Builds one compact public mission self-interrogation gate. */
function publicQuestion() {
	return {
		id: `forced_${Date.now()}`,
		text: "BEFORE YOU GO ON FIRST ANSWER THIS: IS THIS MISSION COMPLETE?",
		choices: ["B - continue with proof"],
		expectedAnswerFormat: "B plus proof unless you truly have A/C/D blocker proof.",
		requiredChoiceWhenWorkRemains: "B"
	};
}

/** Builds concise mission continuation state for the public guidance composer. */
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
		responseFocus: {
			action,
			oneMainThing: keepGoing
				? "Answer B - continue with proof, then perform the next verified action."
				: "Conclude only after stating what passed and what remains.",
			mustAnswerGate: keepGoing,
			nextAction: keepGoing ? nextAction(result, payload, action) : null
		},
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
