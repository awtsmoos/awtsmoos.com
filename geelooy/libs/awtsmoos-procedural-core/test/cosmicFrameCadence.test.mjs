// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicFrameCadenceTest
 * @description
 * The Awtsmoos verifies that each vessel receives motion at its proper cadence.
 * Awtsmoos.com keeps one scheduler while expensive draws follow 60, 45, or 30 FPS.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { choosePerformanceProfile } from "../src/core/webgl/cosmicFeed/performanceProfile.js";
import { CosmicSceneRuntime } from "../src/core/webgl/cosmicFeed/sceneRuntime.js";
import { publishSceneProfile } from "../src/core/webgl/cosmicFeed/sceneProfile.js";

function createScene(frameInterval, name = "test") {
	return {
		profile: {
			name,
			frameInterval,
			particleCount: 1,
			glyphCount: 0,
			motionScale: 1,
			reducedMotion: false
		},
		canvas: { dataset: {} },
		kineticField: { energy: 0 },
		draw() {}
	};
}

function withViewport(width, height, callback) {
	const previousWidth = globalThis.innerWidth;
	const previousHeight = globalThis.innerHeight;
	const previousMatchMedia = globalThis.matchMedia;
	globalThis.innerWidth = width;
	globalThis.innerHeight = height;
	globalThis.matchMedia = () => ({ matches: false });
	try {
		return callback();
	} finally {
		globalThis.innerWidth = previousWidth;
		globalThis.innerHeight = previousHeight;
		globalThis.matchMedia = previousMatchMedia;
	}
}

test("profiles declare deterministic 60, 45, and 30 FPS intervals", () => {
	const strong = { deviceMemory: 8, hardwareConcurrency: 8, connection: {} };
	const high = withViewport(1536, 1173, () => choosePerformanceProfile(strong, { matches: false }));
	const balanced = withViewport(900, 700, () => choosePerformanceProfile(strong, { matches: false }));
	const lean = withViewport(390, 844, () => choosePerformanceProfile(strong, { matches: false }));
	assert.equal(Math.round(1000 / high.frameInterval), 60);
	assert.equal(Math.round(1000 / balanced.frameInterval), 45);
	assert.equal(Math.round(1000 / lean.frameInterval), 30);
});

test("runtime skips only draws that arrive before the active interval", () => {
	const runtime = new CosmicSceneRuntime(createScene(1000 / 30, "lean"));
	assert.equal(runtime.shouldRender(100), true);
	runtime.lastRenderedAt = 100;
	assert.equal(runtime.shouldRender(120), false);
	assert.equal(runtime.shouldRender(133), true);
});

test("published diagnostics expose truthful target FPS", () => {
	const scene = createScene(1000 / 45, "balanced");
	publishSceneProfile(scene);
	assert.equal(scene.canvas.dataset.targetFps, "45");
	assert.equal(scene.canvas.dataset.performanceProfile, "balanced");
});
