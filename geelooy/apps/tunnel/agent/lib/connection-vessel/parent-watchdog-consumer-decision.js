// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./parent-watchdog-policy.js");

/**
 * @file Converts factual watchdog testimony into one bounded repair decision.
 * @description
 * The Awtsmoos lets the witness speak before Gevurah acts. Awtsmoos.com keeps the
 * stronger parent/control repair reason authoritative, then allows consumer recovery
 * only when its independent sustained policy has already earned one durable claim.
 */
function decide(options = {}) {
	const inspection = options.inspection || {};
	const execution = options.execution || {};
	const pressure = options.pressure || {};
	const consumerRecovery = options.consumerRecovery;
	const consumer = consumerRecovery.observe({
		registered: options.registered === true,
		execution,
		pressure,
		parentUnresponsive: inspection.parentUnresponsive,
		controlStalled: inspection.controlStalled
	});
	const consumerAuthorized = consumer.repairAuthorized === true && !inspection.repairRequired;
	const candidate = {
		...inspection,
		repairRequired: inspection.repairRequired || consumerAuthorized,
		repairReason: inspection.repairReason || (consumerAuthorized ? consumer.reason : ""),
		consumerRecovery: consumerRecovery.snapshot()
	};
	const deferred = Policy.shouldDeferRepair(candidate, pressure);
	return {
		...candidate,
		repairRequired: candidate.repairRequired && !deferred,
		repairDeferred: deferred,
		repairDeferredReason: Policy.deferredReason(candidate, pressure)
	};
}

module.exports = { decide };
