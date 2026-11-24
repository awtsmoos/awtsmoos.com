// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file One bounded continuation tick for the Continue* mission actions.
 * @description
 * The Awtsmoos renews a mission in small witnessed steps, never in one
 * endless request. missionContinueOneHour leases a one-hour window and
 * missionContinueUntilGate runs until the mission gate itself says done;
 * each individual call still performs at most maxSteps next-step
 * evaluations and returns mustCallNext while work and window remain.
 * This is a bounded tick, not unlimited autonomy.
 */
const ONE_HOUR_MS = 3600000;

function intIn(value, fallback, min, max) {
	const n = Number(value);
	return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
}

/** Normalizes the window for a mode without ever widening it silently. */
function windowFor(mode, payload = {}) {
	if (mode === "untilGate") {
		return { mode, windowMs: null, stopOnGate: true };
	}
	return {
		mode: "oneHour",
		windowMs: intIn(payload.windowMs || payload.minimumRunMs, ONE_HOUR_MS, 1000, ONE_HOUR_MS),
		stopOnGate: payload.stopOnGate === true || payload.stopOnGate === "true"
	};
}

/**
 * Runs one bounded tick against an injected next-step function.
 * @param {{next: function}} engine next() returns a step object per call.
 * @param {object} payload maxSteps (1..64, default 8) bounds this call.
 * @param {string} mode "oneHour" or "untilGate".
 */
function tick(engine, payload = {}, mode = "oneHour") {
	if (!engine || typeof engine.next !== "function") throw new Error("continuation_next_required");
	const win = windowFor(mode, payload);
	const maxSteps = intIn(payload.maxSteps, 8, 1, 64);
	let stepsRun = 0, last = null, done = false, gate = false;
	while (stepsRun < maxSteps) {
		last = engine.next();
		stepsRun += 1;
		if (!last || last.done === true || last.keepGoing === false) { done = true; break; }
		if (win.stopOnGate && /gate/i.test(String(last.verdict || ""))) { gate = true; break; }
	}
	const mustCallNext = !done && !gate;
	return {
		ok: true, bounded: true, ...win, maxSteps, stepsRun,
		done, gateReached: gate, lastVerdict: last ? String(last.verdict || "") : "",
		mustCallNext,
		nextAction: mustCallNext
			? (win.mode === "untilGate" ? "missionContinueUntilGate" : "missionContinueOneHour")
			: null,
		note: "One bounded tick only; continuation proceeds by explicit re-call within the window, never by one endless request."
	};
}

module.exports = { ONE_HOUR_MS, tick, windowFor };
