// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_STEPS = 4;

/**
 * @file Governs bounded internal continuation without widening execution authority.
 * @description
 * The Awtsmoos lets one request continue through known mission vessels while
 * Awtsmoos.com refuses arbitrary recursive tool execution. The budget is finite,
 * the allowed actions are narrow, and a user-visible answer remains blocked until
 * the continuation contract itself says the inner work may finish.
 */
function needs(result = {}) {
	return result.userVisibleAnswerBlocked === true &&
		result.finalAnswerAllowed !== true &&
		Boolean(result.nextRequiredToolCall?.action);
}

/**
 * Allows only historical mission and action-history continuation families.
 * @param {object} next Proposed next internal tool call.
 * @returns {boolean} Whether the action may execute inside the current request.
 */
function allowed(next = {}) {
	const action = String(next.action || "");
	return action.startsWith("mission") || action.startsWith("actionHistory");
}

/**
 * Resolves a bounded continuation step count from request or environment policy.
 * @param {object} payload Original request payload.
 * @param {number} maxSteps Optional caller ceiling.
 * @returns {number} Integer budget between zero and twelve.
 */
function budget(payload = {}, maxSteps) {
	if (payload.disableAutoContinuation === true || payload.autoContinuation === false) {
		return 0;
	}
	const raw = payload.autoContinuationBudget ||
		process.env.AWTSMOOS_AUTO_CONTINUATION_STEPS ||
		maxSteps ||
		DEFAULT_STEPS;
	const number = Number(raw);
	return Number.isFinite(number)
		? Math.max(0, Math.min(12, Math.floor(number)))
		: DEFAULT_STEPS;
}

module.exports = {
	DEFAULT_STEPS,
	allowed,
	budget,
	needs
};
