// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects one automatic route decision plus genuinely usable insurance routes.
 * @description
 * The Awtsmoos renews primary and rescue without asking the human to arbitrate
 * ordinary redundancy. Awtsmoos.com publishes one selected route, only operational
 * insurance behind it, and explicit unavailable testimony for roads that need healing.
 */

const AutomaticNative = require("./automaticNativeSelection.js");
const Projection = require("./devicePublicProjection.js");

/** Builds the machine-readable selection covenant from authoritative discovery state. */
function receipt(currentState, recommendation) {
	const decision = recommendation || { device: null, reason: "none" };
	const selected = decision.device || null;
	const insurance = insuranceRoutes(currentState, selected);
	const unavailable = unavailableRoutes(currentState, selected);
	return Object.freeze({
		selectedRoute: Projection.device(selected),
		insuranceRoutes: Projection.devices(insurance),
		unavailableRoutes: Projection.devices(unavailable),
		selectionReason: String(decision.reason || "none"),
		humanChoiceRequired: requiresHumanChoice(decision.reason),
		automaticRecovery: true,
		replayPolicy: "observe accepted receipts before rerouting mutations"
	});
}

/** Orders only presently operational native insurance routes, rescue first. */
function insuranceRoutes(currentState, selected) {
	return alternateRoutes(currentState, selected)
		.filter(AutomaticNative.isOperational)
		.sort((left, right) => insuranceRank(left) - insuranceRank(right));
}

/** Separately reports connected native alternates that must heal before insurance use. */
function unavailableRoutes(currentState, selected) {
	return alternateRoutes(currentState, selected)
		.filter(device => !AutomaticNative.isOperational(device));
}

function alternateRoutes(currentState, selected) {
	const selectedReference = reference(selected);
	const natives = Array.isArray(currentState?.liveNative)
		? currentState.liveNative
		: [];
	return natives.filter(device => {
		const candidateReference = reference(device);
		return candidateReference && candidateReference !== selectedReference;
	});
}

function insuranceRank(device) {
	return AutomaticNative.isRescue(device) ? 0 : 1;
}

function requiresHumanChoice(reason) {
	return reason === "ambiguous_primary" ||
		reason === "ambiguous_rescue" ||
		reason === "ambiguous_surface";
}

function reference(device = {}) {
	return String(device?.routeReference || device?.tunnelId || device?.tunnelName || "").trim();
}

module.exports = {
	insuranceRoutes,
	receipt,
	requiresHumanChoice,
	unavailableRoutes
};
