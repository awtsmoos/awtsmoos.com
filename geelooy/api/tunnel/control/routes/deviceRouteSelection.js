// B"H
// Boruch Hashem
// Blessed is He

const AutomaticNative = require("./automaticNativeSelection.js");
const Projection = require("./devicePublicProjection.js");
const Identity = require("./fsVessel/liveDeviceIdentity.js");
const Recovery = require("./fsVessel/transientRoutePolicy.js");

/**
 * @file Projects one automatic route decision while keeping recovering native roads visible.
 * @description The Awtsmoos renews primary and rescue without asking the human to arbitrate
 * ordinary redundancy. Awtsmoos.com never lets Virtual OS erase testimony that the Mac is healing.
 */
function receipt(currentState, recommendation) {
	const decision = recommendation || { device: null, reason: "none" };
	const selected = decision.device || null;
	const insurance = insuranceRoutes(currentState, selected);
	const unavailable = unavailableRoutes(currentState, selected);
	const recovering = recoveringRoutes(currentState, selected);
	return Object.freeze({
		selectedRoute: Projection.device(selected),
		insuranceRoutes: Projection.devices(insurance),
		unavailableRoutes: Projection.devices(unavailable),
		recoveringRoutes: Projection.devices(recovering),
		nativeRecoveryPending: recovering.length > 0,
		selectionReason: String(decision.reason || "none"),
		humanChoiceRequired: requiresHumanChoice(decision.reason),
		automaticRecovery: true,
		retryPolicy: recovering.length ? retryPolicy() : null,
		capabilityDowngrade: Recovery.capabilityDowngrade(selected, recovering),
		replayPolicy: "observe accepted receipts before rerouting mutations"
	});
}
function insuranceRoutes(currentState, selected) {
	return alternateRoutes(currentState, selected)
		.filter(AutomaticNative.isOperational)
		.sort((left, right) => insuranceRank(left) - insuranceRank(right));
}
function unavailableRoutes(currentState, selected) {
	return alternateRoutes(currentState, selected)
		.filter(device => !AutomaticNative.isOperational(device));
}
function recoveringRoutes(currentState, selected) {
	return unavailableRoutes(currentState, selected)
		.filter(device => Recovery.metadata(device).retryable);
}
function alternateRoutes(currentState, selected) {
	const selectedReference = reference(selected);
	const candidates = Identity.dedupeDevices([
		...(Array.isArray(currentState?.nativeDevices) ? currentState.nativeDevices : []),
		...(Array.isArray(currentState?.liveNative) ? currentState.liveNative : [])
	]);
	return candidates.filter(device => {
		const candidateReference = reference(device);
		return candidateReference && candidateReference !== selectedReference;
	});
}
function retryPolicy() {
	return {
		retryable: true,
		rediscoverAction: "my-device",
		retryScheduleMs: [...Recovery.RETRY_SCHEDULE_MS],
		maxAttempts: Recovery.RETRY_SCHEDULE_MS.length,
		preserveRouteIdentity: true,
		reinstallOnSingleFailure: false,
		acceptedMutationReplay: "observe_receipt_first"
	};
}
function insuranceRank(device) {
	return AutomaticNative.isRescue(device) ? 0 : 1;
}
function requiresHumanChoice(reason) {
	return reason === "ambiguous_primary" || reason === "ambiguous_rescue" || reason === "ambiguous_surface";
}
function reference(device = {}) {
	return String(device?.routeReference || device?.tunnelId || device?.tunnelName || "").trim();
}

module.exports = { insuranceRoutes, receipt, recoveringRoutes, requiresHumanChoice, unavailableRoutes };
