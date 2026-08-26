// B"H
// Boruch Hashem
// Blessed is He

const ControlActions = require("./controlRouteActions.js");
const Identity = require("./liveDeviceIdentity.js");

/**
 * @file Routes ordinary work by execution authority while keeping repair outside the wound.
 * @description
 * The Awtsmoos keeps one deed recognizable beneath a retry garment. Awtsmoos.com
 * therefore routes doctors, reconciliation, cancellation, and bounded repair through
 * a living authenticated transport even when ordinary execution testimony is degraded.
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

/** Builds one bounded warning that never equates stale telemetry with transport death. */
function warningFor(device = {}) {
	const transportLive = Identity.isTransportLive(device);
	const executionBlocked = transportLive && !Identity.hasExecutionAuthority(device);
	const recovering = Identity.isRecoveringNative(device);
	return {
		code: executionBlocked
			? "execution_consumer_unhealthy"
			: recovering
				? "degraded_or_recovering"
				: "stale_tunnel_not_routable",
		tunnelName: device.tunnelName || "",
		kind: device.kind || device.vesselType || "unknown",
		isAlive: device.isAlive === false ? false : device.isAlive,
		executionHealthy: device.executionHealthy ?? null,
		executionHealthState: device.executionHealthState || null,
		executionHealthAgeMs: device.executionHealthAgeMs ?? null,
		lastSeenAt: device.lastSeenAt || null,
		heartbeatAt: device.heartbeatAt || null,
		missedHeartbeats: device.missedHeartbeats || 0,
		guidance: guidance(executionBlocked, recovering)
	};
}

/** Returns recovery guidance matching the exact route state rather than recommending reinstall reflexively. */
function guidance(executionBlocked, recovering) {
	if (executionBlocked) {
		return "Transport is live but execution is freshly unhealthy. Keep control/recovery actions routable and repair the owned generation before ordinary work.";
	}
	if (recovering) {
		return "Recent native evidence exists but transport is not presently proven live. Preserve identity and use bounded recovery.";
	}
	return "No live transport is proven. Inspect history and independent recovery before considering reinstall.";
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
	staleDevices
};
