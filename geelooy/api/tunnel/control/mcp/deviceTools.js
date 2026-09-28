// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Reveals one automatic authorized device route plus ordered insurance to MCP clients.
 * @description
 * The Awtsmoos renews each route while names may drift; Awtsmoos.com gives MCP the same
 * selectedRoute covenant as HTTP discovery, so redundant primary/recovery roads never become
 * a needless human question and accepted work is never replayed merely because routing moved.
 */

const Discovery = require("../routes/deviceDiscovery.js");
const Projection = require("../routes/devicePublicProjection.js");
const RouteSelection = require("../routes/deviceRouteSelection.js");

function canonicalReference(device = {}) {
	return String(device.routeReference || device.tunnelId || "").trim();
}

function exactDevice(currentState, reference) {
	const requested = String(reference || "").trim();
	const device = Discovery.find(currentState, requested);
	const canonical = canonicalReference(device);
	if (!device || !canonical || requested !== canonical) {
		throw new Error("An exact immutable routeReference is required.");
	}
	return device;
}

/** Discovers the automatic preferred device or validates one exact immutable route. */
function discover($i, identity, args = {}) {
	const currentState = Discovery.state($i, identity);
	const recommendation = args.routeReference
		? { device: exactDevice(currentState, args.routeReference), reason: "explicit_reference" }
		: Discovery.recommendation(currentState);
	const selection = RouteSelection.receipt(currentState, recommendation);
	const device = recommendation.device;
	if (!device) {
		const message = selection.humanChoiceRequired
			? "Genuinely different authorized device surfaces remain ambiguous."
			: "No operational authorized device is currently available.";
		throw new Error(message);
	}
	const routeReference = canonicalReference(device);
	if (!routeReference) {
		throw new Error("The selected device has no immutable routeReference.");
	}
	return {
		source: "awtsmoos-direct",
		routeReference,
		connected: device.connected !== false,
		device: Projection.device(device),
		...selection,
		warnings: currentState.warnings || []
	};
}

/** Proves that one exact immutable route remains authorized and live. */
function status($i, identity, args = {}) {
	const currentState = Discovery.state($i, identity);
	const device = exactDevice(currentState, args.routeReference);
	return {
		source: "awtsmoos-direct",
		routeReference: canonicalReference(device),
		connected: device.connected !== false,
		device: Projection.device(device)
	};
}

module.exports = {
	canonicalReference,
	discover,
	exactDevice,
	status
};
