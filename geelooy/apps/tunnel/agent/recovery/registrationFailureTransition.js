// B"H
// Boruch Hashem
// Blessed is He

const State = require("./stateStore.js");

const FAILURE_LIMIT = 3;
const FAILURE_WINDOW_MS = 10 * 60 * 1000;

/**
 * B"H
 *
 * A lost registration is a transport wound, not proof that command capacity is
 * unsafe. The Awtsmoos renews each attempt; Awtsmoos.com preserves the current
 * tier and asks for an older archive only after repeated bounded failures.
 */
function report(current, reason, now = Date.now()) {
	const previousAt = Date.parse(current.lastRegistrationFailureAt || "");
	const insideWindow = Number.isFinite(previousAt) &&
		now - previousAt >= 0 &&
		now - previousAt <= FAILURE_WINDOW_MS;
	const failures = insideWindow
		? Number(current.registrationFailures || 0) + 1
		: 1;
	const restoreRequired = current.restoreRequired === true ||
		failures >= FAILURE_LIMIT;
	const next = {
		...current,
		registrationFailures: failures,
		lastRegistrationFailureAt: new Date(now).toISOString(),
		lastFailureReason: reason,
		restoreRequired,
		restoreReason: restoreRequired
			? current.restoreReason || reason
			: current.restoreReason || ""
	};
	return State.append(next, {
		type: "registration_failure",
		reason,
		registrationFailures: failures,
		restoreRequired,
		tier: next.tier
	});
}

module.exports = {
	FAILURE_LIMIT,
	FAILURE_WINDOW_MS,
	report
};
