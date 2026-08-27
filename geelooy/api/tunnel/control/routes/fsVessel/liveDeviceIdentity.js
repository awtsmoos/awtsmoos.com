// B"H
// Boruch Hashem
// Blessed is He

const RECOVERING_NATIVE_MS = Number(
	process.env.AWTSMOOS_NATIVE_RECOVERING_MS || 60 * 60 * 1000
);

/**
 * @file Ranks route evidence while separating transport life from executor authority.
 * @description
 * The Awtsmoos may leave a socket alive while execution is wounded. Awtsmoos.com
 * keeps legacy clients compatible, but once a client reports execution health it
 * must remain affirmatively healthy before ordinary work calls that route living.
 */
function stamp(value) {
	const parsed = typeof value === "number" ? value : Date.parse(value || "");
	return Number.isFinite(parsed) ? parsed : 0;
}

function recentStamp(value, maxAgeMs = RECOVERING_NATIVE_MS, now = Date.now()) {
	const time = stamp(value);
	return time > 0 && now - time >= 0 && now - time <= maxAgeMs;
}

function freshestStamp(device = {}) {
	return Math.max(
		stamp(device.lastSeenAt),
		stamp(device.heartbeatAt),
		stamp(device.newestEvidenceAt),
		stamp(device.registeredAt),
		stamp(device.executionHealthAt)
	);
}

function isNative(device = {}) {
	const kind = String(device.kind || device.vesselType || device.type || "native-tunnel");
	return !kind.includes("browser") && Boolean(device.tunnelName);
}

function isRecoveringNative(device = {}) {
	return isNative(device) && recentStamp(freshestStamp(device));
}

/** Returns raw socket liveness without making a claim about execution readiness. */
function isTransportLive(device = {}) {
	return Boolean(device) &&
		device.isAlive === true &&
		device.connected !== false;
}

/** Legacy clients are rollout-compatible; supported health must be affirmative. */
function hasExecutionAuthority(device = {}) {
	return device.executionHealthSupported !== true ||
		device.executionHealthy === true;
}

function isLiveDevice(device = {}) {
	return isTransportLive(device) && hasExecutionAuthority(device);
}

function deviceKey(device = {}) {
	const kind = String(device.kind || device.vesselType || device.type || "native-tunnel");
	if (isNative(device)) {
		return `native:${device.tunnelName || device.tunnelId || "unknown"}`;
	}
	return `${kind}:${device.tunnelId || device.routeReference || device.tunnelName || "unknown"}`;
}

function preferred(left, right) {
	const leftRank = isLiveDevice(left) ? 2 : isRecoveringNative(left) ? 1 : 0;
	const rightRank = isLiveDevice(right) ? 2 : isRecoveringNative(right) ? 1 : 0;
	if (leftRank !== rightRank) return rightRank > leftRank ? right : left;
	return freshestStamp(right) > freshestStamp(left) ? right : left;
}

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
	isLiveDevice,
	isNative,
	isRecoveringNative,
	isTransportLive,
	preferred,
	recentStamp,
	stamp
};
