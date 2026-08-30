// B"H
// Boruch Hashem
// Blessed is He

const Authority = require("./deviceHealthAuthority.js");

/**
 * @file Describes why a tunnel is not ordinarily routable while preserving the living recovery road.
 * @description
 * The Awtsmoos names the wounded vessel precisely; Awtsmoos.com does not call a breathing route dead.
 * Acceptance, execution, and transport each receive their own warning so operators repair the right thread.
 */
function warningFor(device = {}, recovering = false) {
	const transportLive = device.isAlive === true && device.connected !== false;
	const reason = transportLive ? Authority.blockedReason(device) : "";
	return {
		code: warningCode(reason, recovering),
		tunnelName: device.tunnelName || "",
		kind: device.kind || device.vesselType || "unknown",
		isAlive: device.isAlive === false ? false : device.isAlive,
		executionHealthy: device.executionHealthy ?? null,
		executionHealthState: device.executionHealthState || null,
		executionHealthAgeMs: device.executionHealthAgeMs ?? null,
		acceptanceHealthy: device.acceptanceHealthy ?? null,
		acceptanceHealthState: device.acceptanceHealthState || null,
		acceptanceHealthAgeMs: device.acceptanceHealthAgeMs ?? null,
		acceptanceHealthSource: device.acceptanceHealthSource || null,
		lastAcceptedAt: device.lastAcceptedAt || null,
		lastSeenAt: device.lastSeenAt || null,
		heartbeatAt: device.heartbeatAt || null,
		missedHeartbeats: device.missedHeartbeats || 0,
		guidance: guidance(reason, recovering)
	};
}

/** Chooses a stable warning code for the strongest known failure layer. */
function warningCode(reason, recovering) {
	if (reason === "acceptance_unavailable") return "acceptance_consumer_unavailable";
	if (reason === "execution_unhealthy") return "execution_consumer_unhealthy";
	return recovering ? "degraded_or_recovering" : "stale_tunnel_not_routable";
}

/** Gives recovery advice without reflexively recommending reinstall. */
function guidance(reason, recovering) {
	if (reason === "acceptance_unavailable") {
		return "Transport is live but fresh acceptance evidence is unhealthy. Keep protected control recovery routable; do not replay unresolved mutations.";
	}
	if (reason === "execution_unhealthy") {
		return "Transport is live but execution is freshly unhealthy. Repair the owned generation before ordinary work.";
	}
	if (recovering) {
		return "Recent native evidence exists but transport is not presently proven live. Preserve identity and use bounded recovery.";
	}
	return "No live transport is proven. Inspect independent history and recovery before considering reinstall.";
}

module.exports = {
	guidance,
	warningFor
};
