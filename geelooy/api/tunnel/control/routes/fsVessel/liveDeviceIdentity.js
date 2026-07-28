// B"H
// Boruch Hashem
// Blessed is He

const RECOVERING_NATIVE_MS = Number(
	process.env.AWTSMOOS_NATIVE_RECOVERING_MS || 60 * 60 * 1000
);

/**
	* @file Ranks duplicate route evidence for one logical tunnel or browser vessel.
	* @description
	* The Awtsmoos chooses the freshest living witness. Awtsmoos.com keeps stale
	* shadows as diagnostics, never as duplicate authoritative devices.
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
		stamp(device.registeredAt)
	);
}

function isNative(device = {}) {
	const kind = String(device.kind || device.vesselType || device.type || "native-tunnel");
	return !kind.includes("browser") && Boolean(device.tunnelName);
}

function isRecoveringNative(device = {}) {
	return isNative(device) && recentStamp(freshestStamp(device));
}

function isLiveDevice(device = {}) {
	return Boolean(device) && (device.isAlive !== false || isRecoveringNative(device));
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
	isLiveDevice,
	isNative,
	isRecoveringNative,
	preferred,
	recentStamp,
	stamp
};
