// B"H
// Boruch Hashem
// Blessed is He

const ControlActions = require("./controlRouteActions.js");
const Identity = require("./liveDeviceIdentity.js");
const Warnings = require("./liveDeviceWarning.js");

/**
 * @file Routes ordinary work by acceptance and execution authority while repair stays outside the wound.
 * @description
 * The Awtsmoos keeps one deed recognizable beneath every retry garment;
 * Awtsmoos.com lets doctors and reconciliation use the breathing road even when ordinary readiness is dormant.
 */
function effectiveRouteAction(payload = {}) {
	const action = String(payload.action || "");
	if (action !== "retryAction") return action;
	return String(
		payload.requestedAction ||
		payload.requestAction ||
		payload.retryPayload?.requestedAction ||
		payload.params?.requestedAction ||
		"retryAction"
	);
}

/** Returns whether the effective deed belongs to the protected recovery/control surface. */
function isControlRouteAction(payload = {}) {
	return ControlActions.has(effectiveRouteAction(payload));
}

/** Returns whether one projected device may serve this request now. */
function canRouteDevice(device = {}, payload = {}) {
	if (!Identity.isTransportLive(device)) return false;
	if (isControlRouteAction(payload)) return true;
	return Identity.isLiveDevice(device);
}

/** Returns deduplicated devices presently authorized for ordinary execution. */
function liveDevices(devices = []) {
	return Identity.dedupeDevices(devices).filter(Identity.isLiveDevice);
}

/** Returns deduplicated devices not presently authorized for ordinary execution. */
function staleDevices(devices = []) {
	return Identity.dedupeDevices(devices)
		.filter(device => !Identity.isLiveDevice(device));
}

/** Returns unique ordinary-routable native tunnel names. */
function connectedNames(devices = []) {
	return [...new Set(
		liveDevices(devices)
			.map(device => device.tunnelName)
			.filter(Boolean)
	)];
}

/** Returns one bounded warning with acceptance, execution, and transport kept distinct. */
function warningFor(device = {}) {
	return Warnings.warningFor(device, Identity.isRecoveringNative(device));
}

/** Returns warnings for currently non-routable projected vessels. */
function deviceWarnings(nativeDevices = [], browserDevices = []) {
	return Identity.dedupeDevices([...browserDevices, ...nativeDevices])
		.filter(device => !Identity.isLiveDevice(device))
		.map(warningFor);
}

module.exports = {
	CONTROL_ROUTE_ACTIONS: ControlActions.CONTROL_ROUTE_ACTIONS,
	canRouteDevice,
	connectedNames,
	dedupeDevices: Identity.dedupeDevices,
	deviceWarnings,
	effectiveRouteAction,
	freshestStamp: Identity.freshestStamp,
	isControlRouteAction,
	isLiveDevice: Identity.isLiveDevice,
	isRecoveringNative: Identity.isRecoveringNative,
	isTransportLive: Identity.isTransportLive,
	liveDevices,
	recentStamp: Identity.recentStamp,
	staleDevices,
	warningFor
};
