// B"H
// Boruch Hashem
// Blessed is He

const Authority = require("./deviceHealthAuthority.js");
const Identity = require("./liveDeviceIdentity.js");
const Recovery = require("./transientRoutePolicy.js");

/**
 * @file Emits disclosure-safe warnings that distinguish dead testimony from temporary degradation.
 * @description The Awtsmoos lets one road flicker without erasing its identity. Awtsmoos.com
 * publishes transport, execution, acceptance, and bounded recovery as separate witnesses.
 */
function warningFor(device = {}, recovering = false) {
	const transportLive = Identity.isTransportLive(device);
	const reason = transportLive ? Authority.blockedReason(device) : "transport_unavailable";
	const recovery = Recovery.metadata(device);
	return {
		code: warningCode(reason, recovering, recovery.recoveryState),
		tunnelName: device.tunnelName || null,
		routeReference: device.routeReference || device.tunnelId || null,
		kind: device.kind || device.vesselType || null,
		isAlive: device.isAlive === true,
		transportLive,
		executionHealthy: valueOrNull(device.executionHealthy),
		executionHealthState: device.executionHealthState || null,
		executionHealthAgeMs: valueOrNull(device.executionHealthAgeMs),
		acceptanceHealthy: valueOrNull(device.acceptanceHealthy),
		acceptanceHealthState: device.acceptanceHealthState || null,
		acceptanceHealthAgeMs: valueOrNull(device.acceptanceHealthAgeMs),
		acceptanceHealthSource: device.acceptanceHealthSource || null,
		lastAcceptedAt: device.lastAcceptedAt || null,
		lastSeenAt: device.lastSeenAt || null,
		heartbeatAt: device.heartbeatAt || null,
		missedHeartbeats: Number(device.missedHeartbeats || 0),
		transient: recovery.transient,
		retryable: recovery.retryable,
		recoveryState: recovery.recoveryState,
		retryAfterMs: recovery.retryAfterMs,
		retryScheduleMs: recovery.retryScheduleMs,
		recoveryEvidenceAgeMs: recovery.recoveryEvidenceAgeMs,
		preserveRouteIdentity: recovery.preserveRouteIdentity,
		reinstallOnSingleFailure: recovery.reinstallOnSingleFailure,
		guidance: recovery.guidance
	};
}

function warningCode(reason, recovering, recoveryState) {
	if (reason === "acceptance_unavailable") return "acceptance_consumer_unavailable";
	if (reason === "execution_unhealthy") return "execution_consumer_unhealthy";
	if (recoveryState === "transport_recovering" || recovering) return "degraded_or_recovering";
	return "stale_tunnel_not_routable";
}
function valueOrNull(value) {
	return value === undefined || value === null ? null : value;
}

module.exports = { warningFor };
