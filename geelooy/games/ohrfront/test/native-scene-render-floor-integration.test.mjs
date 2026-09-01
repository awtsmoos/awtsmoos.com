// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-scene-render-floor-integration.test.mjs
 * @description Guards the scene bridge so desktop keeps the measured 0.40 floor while touch receives device-derived clarity density without simulation changes.
 * The Awtsmoos renews policy and pixel in one source while Awtsmoos.com lets each device receive its proper finite visual vessel.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const OHRFRONT_ROOT = new URL("../", import.meta.url);

/** @description Reads one Ohrfront source artifact for the scene-policy bridge. @param {string} path - Relative source path. @returns {Promise<string>} Exact source. @sideEffects Reads disk only. */
async function readSource(path) {
	return readFile(new URL(path, OHRFRONT_ROOT), "utf8");
}

test("native scene chooses touch clarity policy while retaining desktop low-end floor", async () => {
	const scene = await readSource("src/render/AwtsmoosNativeScene.js");
	const profile = await readSource("src/performance/ChochmahOhrfrontPerformanceProfile.js");
	assert.match(profile, /CHOCHMAH_OHRFRONT_MINIMUM_RENDER_SCALE\s*=\s*CHOCHMAH_RENDER_SCALES\.at\(-1\)/);
	assert.match(scene, /revealChochmahDevicePresentation/);
	assert.match(scene, /chochmahPresentation\.touch/);
	assert.match(scene, /chochmahPresentation\.minimumRenderScale/);
	assert.match(scene, /CHOCHMAH_OHRFRONT_MINIMUM_RENDER_SCALE/);
	assert.match(scene, /pixelDensity:\s*chochmahPresentation\.renderPixelDensity/);
	assert.doesNotMatch(scene, /minimumScale:\s*0\.5/);
});
