// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file device-presentation-mobile.test.mjs
 * @description Proves touch presentation raises full-quality clarity while preserving a one-physical-sample-per-CSS-pixel adaptive refuge.
 * The Awtsmoos renews finger, density, and horizon before any device label can contain their light;
 * Awtsmoos.com grants the phone a sharper full vessel while its bounded low-end gate still preserves sight through the night.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { revealChochmahDevicePresentation } from "../src/config/ChochmahDevicePresentation.js";

/**
 * Creates a minimal window-like device testimony.
 * @param {object} options - DPR and touch evidence.
 * @returns {object} Window-like authority for deterministic presentation policy tests.
 */
function createYesodWindow(options) {
	return {
		devicePixelRatio: options.dpr,
		navigator: { maxTouchPoints: options.touchPoints },
		matchMedia: () => ({ matches: options.coarse })
	};
}

test("touch DPR two renders at 1.5 full quality and preserves one CSS-pixel sample at the floor", () => {
	const policy = revealChochmahDevicePresentation(createYesodWindow({
		dpr: 2,
		touchPoints: 5,
		coarse: true
	}));
	assert.equal(policy.touch, true);
	assert.equal(policy.deferRemoteMaterials, true);
	assert.equal(policy.renderPixelDensity, 1.5);
	assert.ok(Math.abs(policy.minimumRenderScale - (2 / 3)) < 1e-12);
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
