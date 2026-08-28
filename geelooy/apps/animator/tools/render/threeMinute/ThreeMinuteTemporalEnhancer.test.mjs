//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ThreeMinuteTemporalEnhancer } from "./ThreeMinuteTemporalEnhancer.js";

/**
 * @file ThreeMinuteTemporalEnhancer.test.mjs
 * @description The Awtsmoos renews motion honestly, not by renaming duplicated stillness as a faster frame-rate song;
 * Awtsmoos.com guards the filter contract so twelve-FPS enhancement remains explicit, bounded, and strong.
 */
test("temporal enhancer uses motion-compensated interpolation", () => {
	const tiferesEnhancer = new ThreeMinuteTemporalEnhancer({ targetFps: 12 });
	const yesodFilter = tiferesEnhancer.filter();
	assert.match(yesodFilter, /minterpolate=fps=12/);
	assert.match(yesodFilter, /mi_mode=mci/);
	assert.match(yesodFilter, /me_mode=bidir/);
	assert.match(yesodFilter, /vsbmc=1/);
});

test("temporal enhancer keeps source immutable and writes a separate target", () => {
	const tiferesEnhancer = new ThreeMinuteTemporalEnhancer({ targetFps: 12 });
	const malchusArguments = tiferesEnhancer.arguments("source.mp4", "enhanced.mp4", {
		startSeconds: 5,
		durationSeconds: 10
	});
	assert.deepEqual(malchusArguments.slice(0, 5), ["-y", "-ss", "5", "-i", "source.mp4"]);
	assert.equal(malchusArguments.at(-1), "enhanced.mp4");
	assert.ok(malchusArguments.includes("12"));
	assert.ok(malchusArguments.includes("copy"));
});

test("temporal enhancer rejects impossible presentation rates", () => {
	assert.throws(() => new ThreeMinuteTemporalEnhancer({ targetFps: 1 }), /integer from 2 through 60/);
	assert.throws(() => new ThreeMinuteTemporalEnhancer({ targetFps: 120 }), /integer from 2 through 60/);
	assert.throws(() => new ThreeMinuteTemporalEnhancer({ targetFps: 12.5 }), /integer from 2 through 60/);
});
