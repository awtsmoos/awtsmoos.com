// B"H

const D = require("./defaults.js");

function integer(value, fallback, min, max) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(min, Math.min(max, Math.floor(number)))
		: fallback;
}

function choice(value, allowed, fallback) {
	return allowed.has(String(value || "")) ? String(value) : fallback;
}

function deadline(value) {
	if (!value) return null;
	const milliseconds = Date.parse(value);
	return Number.isFinite(milliseconds) ? new Date(milliseconds).toISOString() : null;
}

function presetFields(input = {}) {
	const key = String(input.preset || "");
	return D.PRESETS[key] ? { preset: key, ...D.PRESETS[key] } : {};
}

/**
 * B"H — Unknown fields survive the journey so future versions may add light
 * without erasing what an older tunnel cannot yet name. Safety fields are still
 * clamped into bounded, explicit shapes before they govern a living scheduler.
 */
function normalize(input = {}, previous = {}, now = new Date().toISOString()) {
	const defaults = D.base(now);
	const merged = { ...defaults, ...previous, ...presetFields(input), ...input };
	return {
		...merged,
		schemaVersion: D.SCHEMA_VERSION,
		revision: integer(merged.revision, 0, 0, Number.MAX_SAFE_INTEGER),
		runtimeRevision: integer(merged.runtimeRevision, 0, 0, Number.MAX_SAFE_INTEGER),
		desiredState: choice(merged.desiredState, D.DESIRED_STATES, defaults.desiredState),
		observedState: String(merged.observedState || defaults.observedState),
		pauseMode: choice(merged.pauseMode, D.PAUSE_MODES, defaults.pauseMode),
		updateCadence: choice(merged.updateCadence, D.UPDATE_CADENCES, defaults.updateCadence),
		maxTurns: integer(merged.maxTurns, defaults.maxTurns, 0, 100000),
		maxRuntimeMinutes: integer(merged.maxRuntimeMinutes, defaults.maxRuntimeMinutes, 0, 525600),
		maxConsecutiveErrors: integer(merged.maxConsecutiveErrors, defaults.maxConsecutiveErrors, 1, 1000),
		intervalMs: integer(merged.intervalMs, defaults.intervalMs, 250, 3600000),
		pausePollMs: integer(merged.pausePollMs, defaults.pausePollMs, 1000, 3600000),
		deadlineAt: deadline(merged.deadlineAt),
		startedTurns: integer(merged.startedTurns, 0, 0, Number.MAX_SAFE_INTEGER),
		completedTurns: integer(merged.completedTurns, 0, 0, Number.MAX_SAFE_INTEGER),
		totalErrors: integer(merged.totalErrors, 0, 0, Number.MAX_SAFE_INTEGER),
		consecutiveErrors: integer(merged.consecutiveErrors, 0, 0, Number.MAX_SAFE_INTEGER),
		oneTurnCredits: integer(merged.oneTurnCredits, 0, 0, 1000),
		createdAt: merged.createdAt || now,
		updatedAt: merged.updatedAt || now
	};
}

module.exports = { deadline, integer, normalize, presetFields };
