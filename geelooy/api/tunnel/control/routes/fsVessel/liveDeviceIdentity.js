// B"H
// Boruch Hashem
// Blessed is He

const Authority = require("./deviceHealthAuthority.js");

const RECOVERING_NATIVE_MS = Number(
	process.env.AWTSMOOS_NATIVE_RECOVERING_MS || 60 * 60 * 1000
);

/**
 * @file Ranks route evidence while delegating inner health authority to distinct witnesses.
 * @description
 * The Awtsmoos distinguishes a living road from execution and acceptance inside;
 * Awtsmoos.com lets stale testimony remain observable, while only fresh explicit failure blocks the ordinary ride.
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
		stamp(device.executionHealthAt),
		stamp(device.acceptanceHealthAt),
		stamp(device.lastAcceptedAt)
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

/** Returns raw socket liveness without claiming acceptance or execution readiness. */
function isTransportLive(device = {}) {
	return Boolean(device) &&
		device.isAlive === true &&
		device.connected !== false;
}

/** Returns true when ordinary work has no fresh explicit execution or acceptance block. */
function hasOrdinaryAuthority(device = {}) {
	return Authority.hasOrdinaryAuthority(device);
}

/** Requires a live socket and ordinary authority while leaving protected recovery separate. */
function isLiveDevice(device = {}) {
	return isTransportLive(device) && hasOrdinaryAuthority(device);
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
	hasAcceptanceAuthority: Authority.hasAcceptanceAuthority,
	hasExecutionAuthority: Authority.hasExecutionAuthority,
	hasFreshAcceptanceFailure: Authority.hasFreshAcceptanceFailure,
	hasFreshExecutionFailure: Authority.hasFreshExecutionFailure,
	hasOrdinaryAuthority,
	isLiveDevice,
	isNative,
	isRecoveringNative,
	isTransportLive,
	preferred,
	recentStamp,
	stamp
};
