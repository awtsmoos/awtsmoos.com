// B"H
// Boruch Hashem
// Blessed is He

const RECOVERING_NATIVE_MS = Number(
	process.env.AWTSMOOS_NATIVE_RECOVERING_MS || 60 * 60 * 1000
);

/**
 * @file Ranks route evidence without turning stale telemetry into a false death sentence.
 * @description
 * The Awtsmoos distinguishes a living vessel from the freshness of one testimony.
 * Awtsmoos.com blocks a transport only when execution is freshly proven unhealthy;
 * stale execution evidence remains degraded and observable, but cannot quarantine a
 * socket whose transport heartbeats still prove that the native vessel is alive.
 */
function stamp(value) {
	const parsed = typeof value === "number" ? value : Date.parse(value || "");
	return Number.isFinite(parsed) ? parsed : 0;
}

/** Returns whether one timestamp still belongs to the bounded recovery horizon. */
function recentStamp(value, maxAgeMs = RECOVERING_NATIVE_MS, now = Date.now()) {
	const time = stamp(value);
	return time > 0 && now - time >= 0 && now - time <= maxAgeMs;
}

/** Returns the newest independent route witness carried by one projected device. */
function freshestStamp(device = {}) {
	return Math.max(
		stamp(device.lastSeenAt),
		stamp(device.heartbeatAt),
		stamp(device.newestEvidenceAt),
		stamp(device.registeredAt),
		stamp(device.executionHealthAt)
	);
}

/** Distinguishes native tunnel records from browser-tab vessels. */
function isNative(device = {}) {
	const kind = String(device.kind || device.vesselType || device.type || "native-tunnel");
	return !kind.includes("browser") && Boolean(device.tunnelName);
}

/** Returns true while recent native evidence still justifies a recovery classification. */
function isRecoveringNative(device = {}) {
	return isNative(device) && recentStamp(freshestStamp(device));
}

/** Returns raw socket liveness without making a claim about execution readiness. */
function isTransportLive(device = {}) {
	return Boolean(device) &&
		device.isAlive === true &&
		device.connected !== false;
}

/**
 * Returns true only when a fresh supported health report explicitly proves failure.
 * Stale health is unknown, not false; transport liveness remains independently usable.
 */
function hasFreshExecutionFailure(device = {}) {
	return device.executionHealthSupported === true &&
		device.executionHealthFresh !== false &&
		device.executionHealthy === false;
}

/** Legacy and stale-health clients remain routable unless execution is freshly unhealthy. */
function hasExecutionAuthority(device = {}) {
	return !hasFreshExecutionFailure(device);
}

/** Requires a live socket and no fresh explicit execution failure. */
function isLiveDevice(device = {}) {
	return isTransportLive(device) && hasExecutionAuthority(device);
}

/** Builds a stable deduplication key without mixing browser and native identities. */
function deviceKey(device = {}) {
	const kind = String(device.kind || device.vesselType || device.type || "native-tunnel");
	if (isNative(device)) {
		return `native:${device.tunnelName || device.tunnelId || "unknown"}`;
	}
	return `${kind}:${device.tunnelId || device.routeReference || device.tunnelName || "unknown"}`;
}

/** Chooses the strongest current witness while preferring truly live routes. */
function preferred(left, right) {
	const leftRank = isLiveDevice(left) ? 2 : isRecoveringNative(left) ? 1 : 0;
	const rightRank = isLiveDevice(right) ? 2 : isRecoveringNative(right) ? 1 : 0;
	if (leftRank !== rightRank) return rightRank > leftRank ? right : left;
	return freshestStamp(right) > freshestStamp(left) ? right : left;
}

/** Deduplicates projected devices by stable vessel identity. */
function dedupeDevices(devices = []) {
	const selected = new Map();
	for (const device of devices || []) {
		const key = deviceKey(device);
		selected.set(key, selected.has(key)
			? preferred(selected.get(key), device)
			: device);
	}
	return [...selected.values()];
}

module.exports = {
	RECOVERING_NATIVE_MS,
	dedupeDevices,
	deviceKey,
	freshestStamp,
	hasExecutionAuthority,
	hasFreshExecutionFailure,
	isLiveDevice,
	isNative,
	isRecoveringNative,
	isTransportLive,
	preferred,
	recentStamp,
	stamp
};
