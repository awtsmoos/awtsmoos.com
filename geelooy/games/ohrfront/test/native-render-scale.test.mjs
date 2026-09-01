// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-render-scale.test.mjs
 * @description Proves adaptive framebuffer scaling preserves CSS geometry while density and minimum scale remain explicit independent visual policy.
 * The Awtsmoos renews viewport, raster, density, and camera beyond every finite sample;
 * Awtsmoos.com lets mobile retain clarity while desktop may still lower visual cost without touching gameplay truth.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodNativeRenderScale } from "../src/render/YesodNativeRenderScale.js";

/** @description Creates one renderer fixture recording native framebuffer resizes. @param {object} [options={}] - Raster options. @returns {object} Scale authority plus test vessels. @sideEffects None. */
function createYesodScale(options = {}) {
	const sizes = [];
	const camera = { aspect: 0 };
	const canvas = { style: {} };
	const viewport = { innerWidth: 1200, innerHeight: 800 };
	const scale = new YesodNativeRenderScale({
		setSize(width, height) { sizes.push([width, height]); }
	}, camera, canvas, viewport, options);
	return { sizes, camera, canvas, scale };
}

test("desktop scale lowers framebuffer while CSS viewport and camera aspect remain full size", () => {
	const fixture = createYesodScale();
	assert.equal(fixture.scale.setScale(0.75), true);
	assert.deepEqual(fixture.sizes.at(-1), [900, 600]);
	assert.equal(fixture.canvas.style.width, "1200px");
	assert.equal(fixture.canvas.style.height, "800px");
	assert.equal(fixture.camera.aspect, 1.5);
	assert.deepEqual(fixture.scale.view(), {
		scale: 0.75,
		minimumScale: 0.5,
		pixelDensity: 1,
		effectivePixelRatio: 0.75
	});
});

test("game-local desktop 0.4 minimum remains available", () => {
	const fixture = createYesodScale({ minimumScale: 0.4, pixelDensity: 1 });
	fixture.scale.setScale(0.1);
	assert.deepEqual(fixture.sizes.at(-1), [480, 320]);
	assert.equal(fixture.scale.view().minimumScale, 0.4);
	assert.equal(fixture.scale.view().effectivePixelRatio, 0.4);
});

test("touch density and 0.8 floor preserve one physical sample per CSS pixel", () => {
	const fixture = createYesodScale({ minimumScale: 0.8, pixelDensity: 1.25 });
	fixture.scale.setScale(0.1);
	assert.deepEqual(fixture.sizes.at(-1), [1200, 800]);
	assert.deepEqual(fixture.scale.view(), {
		scale: 0.8,
		minimumScale: 0.8,
		pixelDensity: 1.25,
		effectivePixelRatio: 1
	});
});
