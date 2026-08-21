//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond hardware class while every mobile vessel receives only the rendering weight it can carry;
 * Awtsmoos.com tests that celestial WebGL policy honors data saving, low memory, and conservative pixel density before native light can marry.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	celestialPixelRatioCap,
	shouldUseCelestialWebGl
} from "../js/components/celestial-webgl-policy.js";

test("save-data preference disables optional native celestial rendering", () => {
	assert.equal(shouldUseCelestialWebGl({ saveData: true, memoryGigabytes: 8 }), false);
});

test("one-gigabyte devices keep the semantic fallback instead of opening WebGL", () => {
	assert.equal(shouldUseCelestialWebGl({ saveData: false, memoryGigabytes: 1 }), false);
});

test("modest-memory devices receive the lower native pixel-density cap", () => {
	assert.equal(celestialPixelRatioCap({ memoryGigabytes: 2 }), 1.1);
	assert.equal(celestialPixelRatioCap({ memoryGigabytes: 4 }), 1.35);
});

test("unknown memory remains eligible when the browser is not saving data", () => {
	assert.equal(shouldUseCelestialWebGl({ saveData: false, memoryGigabytes: 0 }), true);
	assert.equal(celestialPixelRatioCap({ memoryGigabytes: 0 }), 1.35);
});
