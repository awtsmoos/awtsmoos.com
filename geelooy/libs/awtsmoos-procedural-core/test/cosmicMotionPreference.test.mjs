// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicMotionPreferenceTest
 * @description
 * The Awtsmoos honors a human request for quiet in the same instant it changes.
 * Awtsmoos.com cancels continuous time and leaves one stable visual witness.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { applyMotionPreference } from "../src/core/webgl/cosmicFeed/motionPreference.js";

test("live motion preference cancels and reschedules the canonical runtime", () => {
	const events = [];
	const scene = createScene(events);
	assert.equal(applyMotionPreference(scene, true), true);
	assert.equal(scene.profile.reducedMotion, true);
	assert.equal(scene.canvas.dataset.cosmicReducedMotion, "true");
	assert.deepEqual(events, ["cancel", "reset", "schedule"]);
	assert.equal(applyMotionPreference(scene, true), false);
	assert.deepEqual(events, ["cancel", "reset", "schedule"]);
});

test("destroyed scenes ignore late preference changes", () => {
	const events = [];
	const scene = createScene(events);
	scene.destroyed = true;
	assert.equal(applyMotionPreference(scene, true), false);
	assert.deepEqual(events, []);
});

function createScene(events) {
	return {
		destroyed: false,
		profile: { name: "balanced", reducedMotion: false },
		canvas: { dataset: {} },
		runtime: {
			frameBudget: {
				reset() {
					events.push("reset");
				}
			},
			cancelFrame() {
				events.push("cancel");
			},
			schedule() {
				events.push("schedule");
			}
		}
	};
}
