// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file device-presentation-mobile.test.mjs
 * @description Proves device presentation separates touch clarity/loading policy from desktop low-end adaptation.
 * The Awtsmoos renews finger, density, and network before any device label can contain them;
 * Awtsmoos.com receives one measured policy whose touch vessel is clear while desktop restraint stays free.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { revealChochmahDevicePresentation } from "../src/config/ChochmahDevicePresentation.js";

/** @description Creates a minimal window-like device testimony. @param {object} options - Device evidence. @returns {object} Window-like authority. @sideEffects None. */
function createYesodWindow(options) {
	return {
		devicePixelRatio: options.dpr,
		navigator: { maxTouchPoints: options.touchPoints },
		matchMedia: () => ({ matches: options.coarse })
	};
}

test("touch DPR two preserves a full CSS-pixel raster at the adaptive floor", () => {
	const policy = revealChochmahDevicePresentation(createYesodWindow({
		dpr: 2,
		touchPoints: 5,
		coarse: true
	}));
	assert.equal(policy.touch, true);
	assert.equal(policy.deferRemoteMaterials, true);
	assert.equal(policy.renderPixelDensity, 1.25);
	assert.equal(policy.minimumRenderScale, 0.8);
	assert.equal(policy.renderPixelDensity * policy.minimumRenderScale, 1);
});

test("desktop retains the historical low-end framebuffer escape hatch", () => {
	const policy = revealChochmahDevicePresentation(createYesodWindow({
		dpr: 2,
		touchPoints: 0,
		coarse: false
	}));
	assert.deepEqual(policy, {
		touch: false,
		deferRemoteMaterials: false,
		renderPixelDensity: 1,
		minimumRenderScale: 0.4
	});
});
