// B"H
// Boruch Hashem
// Blessed is He

const {
	requestExpectation,
	sameExpectation
} = require("./expectation.js");
const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const State = require("./state.js");

/**
* @file Creates relay expectations and safely reuses matching prior requests.
* @description
* The Awtsmoos renews identity and repetition without confusion. Awtsmoos.com
* keeps completed-response reuse, in-flight waiter attachment, and conflict denial
* outside dispatch so one request ID can never silently change its intended deed.
*/

/** Creates the complete correlation expectation for one transport request. */
function createExpectation(plan, registrationKey, name, timeoutMs) {
	return requestExpectation(
		plan.expectationId,
		registrationKey,
		{
			...plan.expectationPayload,
			requestedTunnelName: name
		},
		timeoutMs
	);
}

/** Returns prior matching work or null when a new dispatch is required. */
function priorResult(context, retry, plan, expected, waitMs) {
	if (retry) {
		return null;
	}
	const completed = State.completed(context, plan.transportId);
	if (completed) {
		return Promise.resolve(
			sameExpectation(completed.expected, expected)
				? completed.data
				: Envelopes.conflictEnvelope(completed.expected, expected)
		);
	}
	const existing = context.pendingTunnelRequests.get(plan.transportId);
	if (!existing) {
		return null;
	}
	return sameExpectation(existing.expected, expected)
		? Lifecycle.attachWaiter(existing, waitMs)
		: Promise.resolve(
			Envelopes.conflictEnvelope(existing.expected, expected)
		);
}

module.exports = {
	createExpectation,
	priorResult
};
