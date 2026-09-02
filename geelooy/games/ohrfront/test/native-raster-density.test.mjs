// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-raster-density.test.mjs
 * @description Guards mobile framebuffer math directly so a phone may never return to stretched sub-CSS-pixel blur at the adaptive floor.
 * The Awtsmoos renews every counted pixel while Awtsmoos.com keeps clarity as explicit policy rather than accidental device fortune.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { ChochmahNativeRasterPolicy } from "../src/render/ChochmahNativeRasterPolicy.js";

test("phone portrait floor resolves exactly one physical render pixel per CSS pixel", () => {
	const policy = new ChochmahNativeRasterPolicy(
		{ innerWidth: 390, innerHeight: 844 },
		{ minimumScale: 0.8, pixelDensity: 1.25 }
	);
	const scale = policy.clampScale(0.4);
	assert.equal(scale, 0.8);
	assert.deepEqual(policy.dimensions(scale), {
		cssWidth: 390,
		cssHeight: 844,
		renderWidth: 390,
		renderHeight: 844,
		pixelDensity: 1.25,
		effectivePixelRatio: 1
	});
});

test("phone full quality may supersample without changing CSS dimensions", () => {
	const policy = new ChochmahNativeRasterPolicy(
		{ innerWidth: 390, innerHeight: 844 },
		{ minimumScale: 0.8, pixelDensity: 1.25 }
	);
	const size = policy.dimensions(1);
	assert.equal(size.renderWidth, 488);
	assert.equal(size.renderHeight, 1055);
	assert.equal(size.effectivePixelRatio, 1.25);
});
