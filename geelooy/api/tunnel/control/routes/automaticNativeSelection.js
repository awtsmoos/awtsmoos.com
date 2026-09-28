// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_FAILBACK_MS = 10000;
const failovers = new Map();

/**
 * @file Selects the strongest verified native route without asking a human to arbitrate redundancy.
 * @description
 * The Awtsmoos renews every road while Awtsmoos.com prefers present proof over inherited titles:
 * a certified primary leads, a certified rescue outranks an unproven primary, and hysteresis guards
 * failback until the returning primary itself regains full testimony instead of merely reconnecting.
 */
function select(candidates = [], options = {}) {
	const devices = unique(candidates);
	const routable = devices.filter(isOperational);
	const primaries = routable.filter(device => !isRescue(device));
	const rescues = routable.filter(isRescue);
	const key = scopeKey(devices, options.scopeKey);
	const now = finite(options.now, Date.now());
	const failbackMs = Math.max(0, finite(options.failbackMs, DEFAULT_FAILBACK_MS));
	const prior = failovers.get(key);

	if (primaries.length > 1) return result(null, "ambiguous_primary", key);
	if (rescues.length > 1) return result(null, "ambiguous_rescue", key);
	const primary = primaries[0] || null;
	const rescue = rescues[0] || null;
	if (!primary) return selectWithoutPrimary(devices, rescue, key, now, failbackMs);
	if (rescue && isCertified(rescue) && !isCertified(primary)) {
		failovers.set(key, { rescue: name(rescue), until: now + failbackMs });
		return result(rescue, "stronger_verified_rescue", key);
	}
	if (prior && rescue && prior.rescue === name(rescue) && now < prior.until) {
		return result(rescue, "rescue_hysteresis", key);
	}
	failovers.delete(key);
	return result(primary, prior ? "primary_failback" : "healthy_primary", key);
}

function selectWithoutPrimary(devices, rescue, key, now, failbackMs) {
	if (!rescue) {
		failovers.delete(key);
		return result(null, devices.length ? "all_native_unhealthy" : "none", key);
	}
	failovers.set(key, { rescue: name(rescue), until: now + failbackMs });
	return result(rescue, "rescue_failover", key);
}

function result(device, reason, key) {
	return { device, reason, scopeKey: key };
}

/** Accepts legacy devices as operational while allowing verified routes to outrank them. */
function isOperational(device = {}) {
	return device.connected !== false && device.operationalReady !== false;
}

function isCertified(device = {}) {
	return device.ready === true;
}

function unique(candidates = []) {
	const seen = new Set();
	return candidates.filter(device => {
		const tunnelName = name(device);
		if (!tunnelName || seen.has(tunnelName)) return false;
		seen.add(tunnelName);
		return true;
	});
}

function isRescue(device = {}) {
	return /rescue/i.test(`${name(device)} ${String(device.displayName || "")}`);
}

function scopeKey(devices = [], explicit = "") {
	const requested = String(explicit || "").trim();
	if (requested) return `account:${requested}`;
	return `devices:${devices.map(name).sort().join("|")}`;
}

function name(device = {}) {
	return String(device.tunnelName || device.name || "").trim();
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function reset(scope = "") {
	if (!scope) return failovers.clear();
	failovers.delete(String(scope).startsWith("account:") ? String(scope) : `account:${scope}`);
}

module.exports = {
	DEFAULT_FAILBACK_MS,
	isCertified,
	isOperational,
	isRescue,
	reset,
	scopeKey,
	select,
	unique
};
