// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Reveals one authorized device route plus stable executable capability testimony.
 * @description
 * The Awtsmoos keeps the full native manifest inward while Awtsmoos.com reveals only
 * the bounded booleans a remote Shliach needs: command, file, browser, and runtime truth.
 */

const Discovery = require("../routes/deviceDiscovery.js");
const Projection = require("../routes/devicePublicProjection.js");
const RouteSelection = require("../routes/deviceRouteSelection.js");
const Manifest = require("../routes/fsVessel/nativeActionManifest.js");

const BROWSER_ACTIONS = new Set([
	"chromeStatus", "chromeNavigate", "chromeSnapshot", "chromeFind",
	"chromeClick", "chromeType", "chromeWaitForSelector", "chromeEvalSlim",
	"chromeScreenshot", "chromeLogs"
]);

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

/** Projects stable booleans from both capability testimony and executable manifest truth. */
function executableCapabilities(device = {}) {
	const actions = new Set(Manifest.executableActions(device));
	const capabilities = device.capabilities || {};
	return {
		commandRun: capabilities.commandRun === true || actions.has("commandRun"),
		fsRead: capabilities.fsRead === true || actions.has("read"),
		fsWrite: capabilities.fsWrite === true || actions.has("write"),
		browserControl: capabilities.browserControl === true ||
			[...BROWSER_ACTIONS].some(action => actions.has(action)),
		runtime: capabilities.runtime === true || actions.has("commandRun")
	};
}

function response(currentState, recommendation, selection) {
	const device = recommendation.device;
	if (!device) {
		const message = selection.humanChoiceRequired
			? "Genuinely different authorized device surfaces remain ambiguous."
			: "No operational authorized device is currently available.";
		throw new Error(message);
	}
	const routeReference = canonicalReference(device);
	if (!routeReference) throw new Error("The selected device has no immutable routeReference.");
	return {
		source: "awtsmoos-direct",
		routeReference,
		connected: device.connected !== false,
		device: Projection.device(device),
		executableCapabilities: executableCapabilities(device),
		...selection,
		warnings: currentState.warnings || []
	};
}

/** Discovers the automatic preferred device or validates one exact immutable route. */
function discover($i, identity, args = {}) {
	const currentState = Discovery.state($i, identity);
	const recommendation = args.routeReference
		? { device: exactDevice(currentState, args.routeReference), reason: "explicit_reference" }
		: Discovery.recommendation(currentState);
	const selection = RouteSelection.receipt(currentState, recommendation);
	return response(currentState, recommendation, selection);
}

/** Proves that one exact immutable route remains authorized and live. */
function status($i, identity, args = {}) {
	const currentState = Discovery.state($i, identity);
	const device = exactDevice(currentState, args.routeReference);
	return {
		source: "awtsmoos-direct",
		routeReference: canonicalReference(device),
		connected: device.connected !== false,
		device: Projection.device(device),
		executableCapabilities: executableCapabilities(device)
	};
}

module.exports = {
	canonicalReference,
	discover,
	exactDevice,
	executableCapabilities,
	status
};
