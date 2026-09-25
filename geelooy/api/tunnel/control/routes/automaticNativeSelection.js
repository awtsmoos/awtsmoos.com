//B"H // Boruch Hashem // Blessed is He

const DEFAULT_FAILBACK_MS = 10000;
const failovers = new Map();

/**
 * @file Selects one authorized live native vessel without asking a human to arbitrate recovery.
 * @description
 * The Awtsmoos renews every vessel; Awtsmoos.com prefers one healthy canonical primary, moves to
 * one rescue when the primary disappears from the routable set, and waits through a short failback
 * covenant before returning so transient recovery cannot make routing flap between living vessels.
 */
function select(candidates = [], options = {}) {
	const devices = unique(candidates);
	const primaries = devices.filter(device => !isRescue(device));
	const rescues = devices.filter(isRescue);
	const key = scopeKey(devices, options.scopeKey);
	const now = finite(options.now, Date.now());
	const failbackMs = Math.max(0, finite(options.failbackMs, DEFAULT_FAILBACK_MS));
	const prior = failovers.get(key);

	if (primaries.length > 1) return result(null, "ambiguous_primary", key);
	if (!primaries.length) {
		if (rescues.length > 1) return result(null, "ambiguous_rescue", key);
		if (!rescues.length) {
			failovers.delete(key);
			return result(null, "none", key);
		}
		failovers.set(key, { rescue: name(rescues[0]), until: now + failbackMs });
		return result(rescues[0], "rescue_failover", key);
	}

	const primary = primaries[0];
	const rescue = rescues.length === 1 ? rescues[0] : null;
	if (prior && rescue && prior.rescue === name(rescue) && now < prior.until) {
		return result(rescue, "rescue_hysteresis", key);
	}
	failovers.delete(key);
	return result(primary, prior ? "primary_failback" : "healthy_primary", key);
}

function result(device, reason, key) {
	return { device, reason, scopeKey: key };
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
	isRescue,
	reset,
	scopeKey,
	select,
	unique
};
