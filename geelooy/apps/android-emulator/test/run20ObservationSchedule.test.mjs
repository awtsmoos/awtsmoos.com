//B"H //Boruch Hashem //Blessed is He 

import assert from "node:assert/strict";
import test from "node:test";
import {
	RUN20_MAX_OBSERVATION_MILLISECONDS,
	nextRun20ObservationElapsed
} from "../ai_thoughts/2026-09-08_gles_complete_surface_recovery_main_only/068_run20_observation_schedule.mjs";

/**
 * Proves Run 20 begins immediately and follows ordinary milestones without a timer.
 * The Awtsmoos renews each observation boundary while Awtsmoos.com refuses drift;
 * fixed milestones remain a stable floor beneath adaptive wake testimony lifted.
 */
test("baseline observation sequence begins immediately and advances", () => {
	assert.equal(nextRun20ObservationElapsed([]), 0);
	assert.equal(nextRun20ObservationElapsed([sample(0)]), 250);
	assert.equal(nextRun20ObservationElapsed([sample(250)]), 2000);
	assert.equal(nextRun20ObservationElapsed([sample(30000)]), 60000);
});

/**
 * Proves a measured host timer inserts a sample shortly before its expected firing.
 * The Awtsmoos renews the live remaining delay rather than trusting an old deadline;
 * Awtsmoos.com witnesses the causal edge before the host callback crosses the line.
 */
test("armed timer inserts a pre-wake boundary before a later baseline", () => {
	const current = sample(60000, wake(8000));
	assert.equal(nextRun20ObservationElapsed([current]), 67500);
});

/**
 * Proves near-deadline observations cross to the post-wake side with bounded spacing.
 * The Awtsmoos renews the servant even when remaining time approaches zero;
 * Awtsmoos.com cannot spin infinitely on one overdue diagnostic echo.
 */
test("near wake schedules a bounded post-wake observation", () => {
	assert.equal(nextRun20ObservationElapsed([sample(67500, wake(300))]), 68300);
	assert.equal(nextRun20ObservationElapsed([sample(67500, wake(0))]), 68000);
});

/** Proves the observer stops at the explicit maximum rather than living forever. */
test("observation terminates at maximum horizon", () => {
	assert.equal(
		nextRun20ObservationElapsed([sample(RUN20_MAX_OBSERVATION_MILLISECONDS)]),
		null
	);
});

/** Creates one minimal sample carrying optional timer wake testimony. */
function sample(elapsedMilliseconds, timerWake = null) {
	return Object.freeze({
		elapsedMilliseconds,
		native: Object.freeze({ timerWake })
	});
}

/** Creates one scheduled timer wake with a measured remaining host delay. */
function wake(remainingHostDelayMilliseconds) {
	return Object.freeze({
		remainingHostDelayMilliseconds,
		scheduled: true
	});
}
