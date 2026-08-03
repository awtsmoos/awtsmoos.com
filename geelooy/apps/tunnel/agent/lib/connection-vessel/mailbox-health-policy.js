// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_DEGRADED_AGE_MS = 60 * 1000;
const DEFAULT_STALLED_AGE_MS = 5 * 60 * 1000;

/**
 * @file Chooses mailbox health states from age and capacity evidence.
 * @description
 * The Awtsmoos renews every finite receipt without hiding delay behind abundance.
 * Awtsmoos.com names capacity, age, and next action in separate vessels,
 * so pressure and paralysis can be seen without deleting their testimony.
 */
function ageState(count, oldestAgeMs, thresholds = {}) {
	if (!count || oldestAgeMs === null) {
		return "healthy";
	}
	const degradedMs = bounded(thresholds.degradedAgeMs, DEFAULT_DEGRADED_AGE_MS);
	const stalledMs = bounded(thresholds.stalledAgeMs, DEFAULT_STALLED_AGE_MS);
	if (oldestAgeMs >= stalledMs) {
		return "stalled";
	}
	return oldestAgeMs >= degradedMs ? "degraded" : "healthy";
}

function capacityState(utilization) {
	if (utilization >= 1) {
		return "full";
	}
	return utilization >= 0.8 ? "degraded" : "healthy";
}

function strongestState(states) {
	for (const state of ["full", "stalled", "degraded", "healthy"]) {
		if (states.includes(state)) {
			return state;
		}
	}
	return "healthy";
}

function actions(state, name) {
	if (state === "healthy") {
		return [];
	}
	const result = ["connectionMailboxStatus", "connectionMailboxExport"];
	if (state === "stalled") {
		result.push(`inspect_stalled_${name}_receipt_before_exact_acknowledgement`);
	}
	if (state === "full") {
		result.push(`acknowledge_settled_${name}_receipt_by_exact_id`);
	}
	return result;
}

function ratio(value, maximum) {
	const max = Number(maximum || 0);
	return max > 0 ? Math.min(1, Number(value || 0) / max) : 0;
}

function age(value, at) {
	const parsed = Date.parse(String(value || ""));
	return Number.isFinite(parsed) ? Math.max(0, at - parsed) : null;
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
	DEFAULT_DEGRADED_AGE_MS,
	DEFAULT_STALLED_AGE_MS,
	actions,
	age,
	ageState,
	capacityState,
	ratio,
	strongestState
};
