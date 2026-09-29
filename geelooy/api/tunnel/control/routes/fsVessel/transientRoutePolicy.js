// B"H
// Boruch Hashem
// Blessed is He

const Authority = require("./deviceHealthAuthority.js");
const Identity = require("./liveDeviceIdentity.js");

const RETRY_SCHEDULE_MS = Object.freeze([1000, 2000, 4000, 8000, 15000]);

/**
 * @file Classifies wounded native routes without confusing a short recovery window with death.
 * @description The Awtsmoos preserves one immutable road through changing socket testimony;
 * Awtsmoos.com gives agents bounded retry law while never authorizing unsafe ordinary execution.
 */
function recoveryState(device = {}) {
	if (Identity.isTransportLive(device)) {
		const reason = Authority.blockedReason(device);
		if (reason === "execution_unhealthy") return "execution_degraded";
		if (reason === "acceptance_unavailable") return "acceptance_degraded";
		return "healthy";
	}
	return Identity.isRecoveringNative(device) ? "transport_recovering" : "stale";
}

function metadata(device = {}, now = Date.now()) {
	const state = recoveryState(device);
	const witnessAt = Identity.freshestStamp(device);
	const ageMs = witnessAt > 0 ? Math.max(0, now - witnessAt) : null;
	const retryable = state === "transport_recovering" || state === "execution_degraded" || state === "acceptance_degraded";
	return {
		transient: retryable,
		retryable,
		recoveryState: state,
		retryAfterMs: retryable ? RETRY_SCHEDULE_MS[0] : null,
		retryScheduleMs: retryable ? [...RETRY_SCHEDULE_MS] : [],
		maxRetryAfterMs: retryable ? RETRY_SCHEDULE_MS.at(-1) : null,
		routeReference: reference(device) || null,
		lastSeenAt: device.lastSeenAt || null,
		recoveryEvidenceAgeMs: ageMs,
		rediscoverUrl: "/api/tunnel/control/my-device",
		preserveRouteIdentity: true,
		reinstallOnSingleFailure: false,
		guidance: guidance(state)
	};
}

function guidance(state) {
	if (state === "transport_recovering") return "Recent native evidence exists. Rediscover and retry with bounded backoff; preserve this route identity and do not reinstall from one flap.";
	if (state === "execution_degraded") return "Transport is alive but execution is degraded. Keep recovery/control actions available and retry ordinary work only after rediscovery proves execution healthy.";
	if (state === "acceptance_degraded") return "Transport is alive but acceptance is degraded. Observe unresolved receipts before replay and retry only after rediscovery.";
	return state === "healthy" ? "Native route is healthy." : "No recent recovery evidence is proven; inspect history before repair or reinstall.";
}

function capabilityDowngrade(selected, recovering = []) {
	const virtual = selected?.synthetic === true || selected?.kind === "virtual-os" || selected?.vesselType === "virtual-os";
	if (!virtual || !recovering.length) return null;
	return {
		active: true,
		selectedKind: "virtual-os",
		nativeOnlyActionsMayBeUnavailable: true,
		guidance: "Virtual OS is not an equivalent substitute for native shell, command, browser, or local filesystem work. Prefer bounded native recovery when the requested deed needs the Mac."
	};
}

function reference(device = {}) {
	return String(device.routeReference || device.tunnelId || device.tunnelName || "").trim();
}

module.exports = { RETRY_SCHEDULE_MS, capabilityDowngrade, guidance, metadata, recoveryState };
