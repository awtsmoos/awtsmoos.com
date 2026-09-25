//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Reveals authorized device identity and liveness to the MCP boundary.
 * @description
 * The Awtsmoos renews each route while names may drift or fade; Awtsmoos.com
 * returns the immutable reference by which the guarded journey must be made.
 * Friendly aliases may describe a device, but never become authority here.
 */

const Discovery = require("../routes/deviceDiscovery.js");
const Projection = require("../routes/devicePublicProjection.js");

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

/** Discovers the preferred live authorized device or validates an exact route. */
function discover($i, identity, args = {}) {
	const currentState = Discovery.state($i, identity);
	const device = args.routeReference
		? exactDevice(currentState, args.routeReference)
		: Discovery.recommend(currentState);
	if (!device) {
		throw new Error("Multiple authorized device surfaces are live; supply routeReference.");
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
