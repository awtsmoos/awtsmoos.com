// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./liveDeviceIdentity.js");

const CONTROL_ROUTE_ACTIONS = new Set([
	"heartbeat", "tunnelHeartbeat", "agentHeartbeat", "ping", "pong", "status",
	"tunnelStatus", "agentStatus", "commandStatus", "commandPoll",
	"commandJobStatus", "jobStatus", "commandJobOutputPage",
	"commandOutputPage", "commandCancel", "commandJobCancel", "commandWait",
	"commandJobWait", "payloadEcho", "configGet", "tunnelDoctor",
	"agentDoctor", "runtimeSnapshot", "tunnelLivenessTimeline"
]);

/**
	* @file Exposes one routable record per logical device and honest stale warnings.
	* @description
	* The Awtsmoos does not multiply one tunnel because old registration shadows
	* remain. Awtsmoos.com routes the chosen witness and preserves diagnostic truth.
	*/
function isControlRouteAction(payload = {}) {
	return CONTROL_ROUTE_ACTIONS.has(String(payload.action || ""));
}

function canRouteDevice(device = {}, payload = {}) {
	return Identity.isLiveDevice(device);
}

function liveDevices(devices = []) {
	return Identity.dedupeDevices(devices).filter(Identity.isLiveDevice);
}

function staleDevices(devices = []) {
	return Identity.dedupeDevices(devices)
		.filter(device => !Identity.isLiveDevice(device));
}

function connectedNames(devices = []) {
	return [...new Set(liveDevices(devices)
		.map(device => device.tunnelName)
		.filter(Boolean))];
}

function warningFor(device = {}) {
	const recovering = Identity.isRecoveringNative(device);
	return {
		code: recovering ? "degraded_or_recovering" : "stale_tunnel_not_routable",
		tunnelName: device.tunnelName || "",
		kind: device.kind || device.vesselType || "unknown",
		isAlive: device.isAlive === false ? false : device.isAlive,
		lastSeenAt: device.lastSeenAt || null,
		heartbeatAt: device.heartbeatAt || null,
		missedHeartbeats: device.missedHeartbeats || 0,
		guidance: recovering
			? "Recent native evidence exists; route control actions and avoid hard-dead fallback."
			: "Heavy routing is paused after heartbeat grace; inspect status before restart."
	};
}

function deviceWarnings(nativeDevices = [], browserDevices = []) {
	return Identity.dedupeDevices([...browserDevices, ...nativeDevices])
		.filter(device => !Identity.isLiveDevice(device))
		.map(warningFor);
}

module.exports = {
	CONTROL_ROUTE_ACTIONS,
	canRouteDevice,
	connectedNames,
	dedupeDevices: Identity.dedupeDevices,
	deviceWarnings,
	freshestStamp: Identity.freshestStamp,
	isControlRouteAction,
	isLiveDevice: Identity.isLiveDevice,
	isRecoveringNative: Identity.isRecoveringNative,
	liveDevices,
	recentStamp: Identity.recentStamp,
	staleDevices
};
