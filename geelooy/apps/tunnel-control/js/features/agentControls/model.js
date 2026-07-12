// B"H

export const PRESET_ORDER = ["gentle", "focused", "deep", "overnight", "review"];

export function continuationOf(state = {}) {
	return state.continuation || {
		revision: 0,
		preset: "focused",
		desiredState: "running",
		observedState: "idle",
		maxTurns: 25,
		maxRuntimeMinutes: 120,
		maxConsecutiveErrors: 3,
		intervalMs: 5000,
		updateCadence: "normal",
		pauseMode: "after-action",
		startedTurns: 0,
		completedTurns: 0,
		totalErrors: 0,
		consecutiveErrors: 0,
		oneTurnCredits: 0
	};
}

export function policyFromDocument(control) {
	return {
		preset: value("turnPreset", control.preset),
		maxTurns: numberValue("turnMaxTurns", control.maxTurns),
		maxRuntimeMinutes: numberValue("turnRuntimeMinutes", control.maxRuntimeMinutes),
		maxConsecutiveErrors: numberValue("turnMaxErrors", control.maxConsecutiveErrors),
		intervalMs: numberValue("turnIntervalMs", control.intervalMs),
		updateCadence: value("turnCadence", control.updateCadence),
		pauseMode: value("turnPauseMode", control.pauseMode)
	};
}

export function progress(control = {}) {
	if (!control.maxTurns) return 0;
	return Math.max(0, Math.min(100, Math.round(control.startedTurns / control.maxTurns * 100)));
}

export function stateLabel(control = {}) {
	return `${control.desiredState || "unknown"} · ${control.observedState || "unknown"}`;
}

export function duration(milliseconds) {
	const seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function value(id, fallback) {
	return document.getElementById(id)?.value || fallback;
}

function numberValue(id, fallback) {
	const number = Number(document.getElementById(id)?.value);
	return Number.isFinite(number) ? number : fallback;
}
