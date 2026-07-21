// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPerformanceProfileTest
 * @description
 * The Awtsmoos verifies that abundance follows actual vessel strength.
 * Awtsmoos.com grants high motion to capable reference viewports while honoring
 * coarse input, narrow screens, save-data, and reduced-motion restraint.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
	choosePerformanceProfile
} from "../src/core/webgl/cosmicFeed/performanceProfile.js";

const STRONG_NAVIGATOR = Object.freeze({
	deviceMemory: 8,
	hardwareConcurrency: 8,
	connection: Object.freeze({ saveData: false })
});

function withViewport(width, height, coarsePointer, callback) {
	const previousWidth = globalThis.innerWidth;
	const previousHeight = globalThis.innerHeight;
	const previousMatchMedia = globalThis.matchMedia;
	globalThis.innerWidth = width;
	globalThis.innerHeight = height;
	globalThis.matchMedia = query => ({
		matches: query === "(pointer: coarse)" ? coarsePointer : false
	});
	try {
		return callback();
	} finally {
		globalThis.innerWidth = previousWidth;
		globalThis.innerHeight = previousHeight;
		globalThis.matchMedia = previousMatchMedia;
	}
}

function profileFor(width, height, options = {}) {
	return withViewport(width, height, Boolean(options.coarsePointer), () => {
		const navigatorRef = {
			...STRONG_NAVIGATOR,
			connection: { saveData: Boolean(options.saveData) }
		};
		return choosePerformanceProfile(navigatorRef, {
			matches: Boolean(options.reducedMotion)
		});
	});
}

test("capable desktop and portrait references receive the high tier", () => {
	const desktop = profileFor(1536, 1173);
	const portrait = profileFor(864, 1536);
	for (const profile of [desktop, portrait]) {
		assert.equal(profile.name, "high");
		assert.equal(profile.particleCount, 15000);
		assert.equal(profile.maximumPixelRatio, 1.45);
	}
});

test("coarse input keeps the tall portrait reference balanced", () => {
	const profile = profileFor(864, 1536, { coarsePointer: true });
	assert.equal(profile.name, "balanced");
	assert.equal(profile.particleCount, 6500);
});

test("narrow, save-data, and reduced-motion vessels select lean", () => {
	const narrow = profileFor(390, 844);
	const saveData = profileFor(1536, 1173, { saveData: true });
	const reduced = profileFor(1536, 1173, { reducedMotion: true });
	assert.equal(narrow.name, "lean");
	assert.equal(saveData.name, "lean");
	assert.equal(reduced.name, "lean");
	assert.equal(reduced.reducedMotion, true);
});
