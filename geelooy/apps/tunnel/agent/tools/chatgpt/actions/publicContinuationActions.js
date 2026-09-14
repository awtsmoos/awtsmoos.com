//B"H
//Boruch Hashem
//Blessed be He

const Continuation = require("./continuation.js");

/**
 * @file Preserves public continuation aliases behind one canonical browser payload.
 * @description
 * Continuation calls remain short and resumable while inheriting the device
 * browser authority selected by the top-level ChatGPT dispatcher.
 */
function buildPublicContinuationActions(payload) {
	return {
		async chatgptContinuationStart() {
			return await Continuation.chatgptContinuationStart(payload);
		},
		async chatgptContinuationStatus() {
			return await Continuation.chatgptContinuationStatus(payload);
		},
		async chatgptContinuationStop() {
			return await Continuation.chatgptContinuationStop(payload);
		},
		async chatgptContinuationTick() {
			return await Continuation.chatgptContinuationTick(payload);
		},
		async chatgptContinuationAuto() {
			return await Continuation.chatgptContinuationAuto(payload);
		},
		async chatgptContinuationConclusion() {
			return await Continuation.chatgptContinuationConclusion(payload);
		}
	};
}

module.exports = {
	buildPublicContinuationActions
};
