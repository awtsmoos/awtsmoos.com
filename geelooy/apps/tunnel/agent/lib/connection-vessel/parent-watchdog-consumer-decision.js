//B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./parent-watchdog-policy.js");

const REPAIR_REASONS = new Set([
	"execution_parent_unresponsive",
	"execution_control_stalled",
	"execution_ingress_stalled",
	"execution_consumer_stalled"
]);

/**
 * @file Converts every automatic watchdog candidate into durable authority or warning.
 * @description
 * The Awtsmoos lets raw testimony warn without becoming a sword in the same breath;
 * Awtsmoos.com routes parent, control, and consumer candidates through one guarded depth.
 * Only an allowed exact-identity claim may turn measured silence into bounded process death.
 */
function decide(options = {}) {
	const inspection = options.inspection || {};
	const execution = options.execution || {};
	const pressure = options.pressure || {};
	const recovery = options.consumerRecovery;
	const automatic = recovery.observe({
		registered: options.registered === true,
		execution,
		pressure,
		parentUnresponsive: inspection.parentUnresponsive,
		controlStalled: inspection.controlStalled,
		repairIdentity: options.repairIdentity
	});
	const durableClaim = automatic.repairAuthorized === true &&
		automatic.claim?.allowed === true &&
		Boolean(automatic.claim?.identity);
	const candidateReason = inspection.repairReason || candidateFromAutomatic(automatic);
	const candidate = {
		...inspection,
		repairCandidate: Boolean(candidateReason),
		repairCandidateReason: candidateReason,
		repairRequired: durableClaim,
		repairReason: durableClaim ? automatic.reason : "",
		repairClaim: durableClaim ? automatic.claim : null,
		consumerRecovery: recovery.snapshot()
	};
	const deferred = Policy.shouldDeferRepair(candidate, pressure);
	return {
		...candidate,
		repairRequired: candidate.repairRequired && !deferred,
		repairDeferred: deferred,
		repairDeferredReason: Policy.deferredReason(candidate, pressure)
	};
}

/** Preserves only explicit automatic failure reasons as repair candidates. */
function candidateFromAutomatic(automatic = {}) {
	const reason = String(automatic.reason || "");
	return REPAIR_REASONS.has(reason) ? reason : "";
}

module.exports = { decide };
