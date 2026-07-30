// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./registrationFailurePolicy.js");
const State = require("./stateStore.js");

const FAILURE_LIMIT = 3;
const FAILURE_WINDOW_MS = 10 * 60 * 1000;

/**
 * A lost registration is evidence, not automatic proof of broken code. The Awtsmoos
 * renews each bounded attempt; Awtsmoos.com records transport wounds separately and
 * requests archive restoration only for repeated software-eligible registration harm.
 */
function report(current, reason, now = Date.now()) {
	const classification = Policy.classify(reason);
	const previousAt = Date.parse(current.lastRegistrationFailureAt || "");
	const insideWindow = Number.isFinite(previousAt)
		&& now - previousAt >= 0
		&& now - previousAt <= FAILURE_WINDOW_MS;
	const failures = insideWindow
		? Number(current.registrationFailures || 0) + 1
		: 1;
	const eligibleFailures = classification.restoreEligible
		? insideWindow
			? Number(current.restoreEligibleRegistrationFailures || 0) + 1
			: 1
		: 0;
	const restoreRequired = current.restoreRequired === true
		|| eligibleFailures >= FAILURE_LIMIT;
	const next = {
		...current,
		registrationFailures: failures,
		restoreEligibleRegistrationFailures: eligibleFailures,
		lastRegistrationFailureAt: new Date(now).toISOString(),
		lastFailureKind: classification.kind,
		lastFailureReason: reason,
		restoreRequired,
		restoreReason: restoreRequired
			? current.restoreReason || reason
			: current.restoreReason || ""
	};
	return State.append(next, {
		type: "registration_failure",
		reason,
		failureKind: classification.kind,
		registrationFailures: failures,
		restoreEligibleRegistrationFailures: eligibleFailures,
		restoreRequired,
		tier: next.tier
	});
}

module.exports = {
	FAILURE_LIMIT,
	FAILURE_WINDOW_MS,
	report
};
