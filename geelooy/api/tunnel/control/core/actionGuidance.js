// B"H
// Boruch Hashem
// Blessed is He

const { armProtocolGate } = require("./protocolGateStore.js");
const InstructionGuidance = require("./instructionGuidance.js");
const Protocol = require("./actionGuidanceProtocol.js");

/**
 * @file Composes mission continuation with one terse mandatory pre-write instruction gate.
 * @description
 * The Awtsmoos separates steering from transport and doctrine from mission mechanics.
 * Awtsmoos.com keeps passive responses quiet while write actions receive one sentence
 * that forces instruction resolution before source mutation begins.
 */
function debugWanted(payload = {}) {
	return payload.guidanceDebug === true ||
		payload.guidanceDebug === "true" ||
		payload.debugGuidance === true ||
		payload.debugGuidance === "true";
}

/**
 * Attaches mission and instruction guidance without bloating ordinary responses.
 *
 * @param {object} result Native or server action result.
 * @param {object} payload Original control payload.
 * @returns {object} Result with compact continuation and optional write-instruction guidance.
 */
function attachActionGuidance(result, payload = {}) {
	if (!result || typeof result !== "object" || Array.isArray(result)) return result;
	const protocol = Protocol.protocolFor(result, payload);
	if (protocol.protocolGate) armProtocolGate(payload, protocol.protocolGate);
	const compact = {
		...result,
		...InstructionGuidance.forAction(protocol.action),
		finalAnswerAllowed: protocol.finalAnswerAllowed,
		mustContinue: protocol.mustContinue,
		mustCallNext: protocol.mustCallNext,
		responseFocus: protocol.responseFocus,
		awtsmoosNext: protocol.responseFocus,
		stopRule: protocol.mustContinue
			? "BEFORE YOU GO ON FIRST ANSWER THE MULTIPLE CHOICE."
			: "No forced multiple-choice pending."
	};
	if (protocol.multipleChoiceSelfInterrogation) {
		compact.multipleChoiceSelfInterrogation = protocol.multipleChoiceSelfInterrogation;
	}
	if (!debugWanted(payload)) return compact;
	return {
		...compact,
		aiGuidance: {
			keepGoing: protocol.mustContinue,
			prompt: protocol.responseFocus.oneMainThing,
			responseFocus: protocol.responseFocus,
			keepGoingPrompt: Protocol.DEFAULT_KEEP_GOING_PROMPT,
			concludePrompt: Protocol.DEFAULT_CONCLUDE_PROMPT
		}
	};
}

module.exports = {
	DEFAULT_CONCLUDE_PROMPT: Protocol.DEFAULT_CONCLUDE_PROMPT,
	DEFAULT_KEEP_GOING_PROMPT: Protocol.DEFAULT_KEEP_GOING_PROMPT,
	attachActionGuidance,
	isPassiveAction: Protocol.isPassiveAction,
	protocolFor: Protocol.protocolFor,
	resultDone: Protocol.resultDone
};
