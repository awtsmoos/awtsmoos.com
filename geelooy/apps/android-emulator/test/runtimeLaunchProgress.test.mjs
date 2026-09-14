//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { notifyAndroidLaunchProgress } from "../core/android/runtimeLaunchProgress.js";

/**
 * Proves launch milestones are synchronous immutable truth for UI and diagnostics.
 */
test("Android launch progress emits one immutable synchronous milestone", () => {
	const events = [];
	const delivered = notifyAndroidLaunchProgress({
		onLaunchProgress(event) {
			events.push(event);
		}
	}, "render", {
		attempt: 3
	});
	assert.equal(delivered, true);
	assert.equal(events.length, 1);
	assert.equal(events[0].stage, "render");
	assert.equal(events[0].details.attempt, 3);
	assert.equal(Object.isFrozen(events[0]), true);
	assert.equal(Object.isFrozen(events[0].details), true);
});

/**
 * Proves absent observers are free and invalid observers fail with a coded error.
 */
test("Android launch progress validates only configured observers", () => {
	assert.equal(notifyAndroidLaunchProgress({}, "start"), false);
	assert.throws(
		() => notifyAndroidLaunchProgress({ onLaunchProgress: 7 }, "start"),
		error => error.code === "ANDROID_LAUNCH_PROGRESS_OBSERVER_INVALID"
	);
});
