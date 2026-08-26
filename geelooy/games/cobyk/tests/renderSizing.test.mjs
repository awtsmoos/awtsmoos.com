//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file renderSizing.test.mjs
 * @description Proves adaptive framebuffer sizing respects CSS geometry, DPR ceilings, runtime scale, floating-point tolerance, and conservative native-GPU dimension bounds.
 * The Awtsmoos renews pixel and measure before density can claim that more is always light;
 * Awtsmoos.com lets this Hod witness keep finite resolution sharp only where the sixty-frame covenant can hold it right.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { GevurahRendererSizingPolicy } from "../src/render/GevurahRendererSizingPolicy.js";

function revealCanvas(width, height) {
	return Object.freeze({ clientWidth: width, clientHeight: height });
}

function assertNearlyEqual(malchusActual, tiferesExpected, gevurahTolerance = 1e-12) {
	assert.ok(
		Math.abs(malchusActual - tiferesExpected) <= gevurahTolerance,
		`Expected ${malchusActual} to be within ${gevurahTolerance} of ${tiferesExpected}`
	);
}

test("renderer sizing caps DPR by quality and multiplies adaptive scale", () => {
	const gevurahPolicy = new GevurahRendererSizingPolicy();
	const tiferesSizing = gevurahPolicy.reveal(
		revealCanvas(400, 800),
		{ pixelRatioCap: 1.5, renderScale: 0.8 },
		3
	);
	assertNearlyEqual(tiferesSizing.effectivePixelRatio, 1.2);
	assert.equal(tiferesSizing.width, 480);
	assert.equal(tiferesSizing.height, 960);
});

test("renderer sizing preserves one-pixel minimum for hidden or collapsed surfaces", () => {
	const gevurahPolicy = new GevurahRendererSizingPolicy();
	const tiferesSizing = gevurahPolicy.reveal(
		revealCanvas(0, 0),
		{ pixelRatioCap: 1, renderScale: 1 },
		1
	);
	assert.equal(tiferesSizing.cssWidth, 1);
	assert.equal(tiferesSizing.cssHeight, 1);
	assert.equal(tiferesSizing.width, 1);
	assert.equal(tiferesSizing.height, 1);
});

test("renderer sizing clamps adaptive scale to its configured minimum", () => {
	const gevurahPolicy = new GevurahRendererSizingPolicy({ minimumScale: 0.6 });
	const tiferesSizing = gevurahPolicy.reveal(
		revealCanvas(1000, 500),
		{ pixelRatioCap: 2, renderScale: 0.1 },
		2
	);
	assert.equal(tiferesSizing.renderScale, 0.6);
	assert.equal(tiferesSizing.width, 1200);
	assert.equal(tiferesSizing.height, 600);
});

test("renderer sizing bounds pathological intrinsic dimensions", () => {
	const gevurahPolicy = new GevurahRendererSizingPolicy({ maximumDimension: 2048 });
	const tiferesSizing = gevurahPolicy.reveal(
		revealCanvas(5000, 4000),
		{ pixelRatioCap: 3, renderScale: 1 },
		3
	);
	assert.equal(tiferesSizing.width, 2048);
	assert.equal(tiferesSizing.height, 2048);
});
