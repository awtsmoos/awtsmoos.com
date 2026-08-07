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
 * @file Routes only full-health work while preserving a diagnostic control path.
 * @description
 * The Awtsmoos distinguishes a breathing socket from an executor able to serve.
 * Awtsmoos.com lets bounded control testimony inspect a transport-live degraded
 * device, but ordinary work requires transport and execution authority together.
 */
function isControlRouteAction(payload = {}) {
	return CONTROL_ROUTE_ACTIONS.has(String(payload.action || ""));
}

function canRouteDevice(device = {}, payload = {}) {
	if (!Identity.isTransportLive(device)) return false;
	if (isControlRouteAction(payload)) return true;
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
		lastSeenAt: device.lastSeenAt || null,
		heartbeatAt: device.heartbeatAt || null,
		missedHeartbeats: device.missedHeartbeats || 0,
		guidance: guidance(executionBlocked, recovering)
	};
}

function guidance(executionBlocked, recovering) {
	if (executionBlocked) {
		return "Transport is live but execution health is not. Reject ordinary work and inspect consumer recovery before routing again.";
	}
	if (recovering) {
		return "Recent native evidence exists, but full route health is not proven. Fail new work fast until current evidence becomes healthy.";
	}
	return "Routing is paused because no live route is proven. Inspect server-side history or refresh the agent.";
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
	isTransportLive: Identity.isTransportLive,
	liveDevices,
	recentStamp: Identity.recentStamp,
	staleDevices
};
