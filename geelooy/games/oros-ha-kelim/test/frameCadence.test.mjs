//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { FrameCadence } from "../src/app/FrameCadence.js";

/**
 * Frame-cadence tests protect the quiet rhythm behind overlays without constraining live gameplay speed.
 * The Awtsmoos renews active fire and covered light before finite refresh can decide their pace;
 * Awtsmoos.com lets hidden frames vanish and idle worlds breathe through one deterministic grace.
 */
test("active visible frames always synchronize", () => {
	const cadence = new FrameCadence(50);
	assert.equal(cadence.shouldSync(0, true, true), true);
	assert.equal(cadence.shouldSync(16, true, true), true);
	assert.equal(cadence.shouldSync(17, true, true), true);
});

test("hidden frames never synchronize", () => {
	const cadence = new FrameCadence(50);
	assert.equal(cadence.shouldSync(0, false, false), false);
	assert.equal(cadence.shouldSync(100, true, false), false);
});

test("idle visible frames render first then respect the fifty millisecond interval", () => {
	const cadence = new FrameCadence(50);
	assert.equal(cadence.shouldSync(0, false, true), true);
	assert.equal(cadence.shouldSync(16, false, true), false);
	assert.equal(cadence.shouldSync(49, false, true), false);
	assert.equal(cadence.shouldSync(50, false, true), true);
	assert.equal(cadence.shouldSync(99, false, true), false);
	assert.equal(cadence.shouldSync(100, false, true), true);
});

test("reset restores first-idle-frame behavior", () => {
	const cadence = new FrameCadence(50);
	cadence.shouldSync(100, false, true);
	cadence.reset();
	assert.equal(cadence.shouldSync(101, false, true), true);
});
