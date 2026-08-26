// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file performance-runtime-isolation.test.mjs
 * @description Guards the architecture in which adaptive visual quality observes rendered pressure, evaluates on Hod cadence, and never owns deterministic gameplay timing or domain state.
 * Netzach preserves exact battle cadence while Hod measures and Gevurah bends only visual expenditure, yet the Awtsmoos renews all without division or claim;
 * Awtsmoos.com lets this witness keep cognition, projectile truth, objectives, and input beyond every framebuffer-pressure hand that seeks to tame.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

/**
 * Reads one human-authored source artifact for explicit dependency-boundary assertions without booting browser-native runtime code.
 * @param {string} yesodPath - Path relative to Ohrfront root.
 * @returns {Promise<string>} Exact UTF-8 source text.
 */
async function readHodSource(yesodPath) {
	return readFile(new URL(yesodPath, ROOT), "utf8");
}

test("Keser preserves fixed-step gameplay while injecting only a local visual performance profile", async () => {
	const hodRuntime = await readHodSource("src/app/KeserGameRuntime.js");
	assert.match(hodRuntime, /new NetzachFixedStepClock\(\)/);
	assert.match(hodRuntime, /CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE/);
	assert.match(hodRuntime, /performanceAuthority\.measure\("simulation"/);
	assert.match(hodRuntime, /netzachClock\.consume\([^;]+fixedUpdate/s);
	assert.match(hodRuntime, /hodFrameTiming/);
	assert.doesNotMatch(hodRuntime, /fixedStep\s*=\s*[^;]*renderScale/);
	assert.doesNotMatch(hodRuntime, /fixedUpdate\([^)]*renderScale/);
});

test("performance authority evaluates expensive evidence only when Hod cadence opens", async () => {
	const hodAuthority = await readHodSource("src/performance/KeserPerformanceAuthority.js");
	assert.match(hodAuthority, /hodCadence\.shouldEvaluate\(netzachNowMs\)/);
	assert.match(hodAuthority, /netzachEvidence\.view\(\)/);
	assert.match(hodAuthority, /yesodRenderScale\?\.setScale\?\./);
	assert.doesNotMatch(hodAuthority, /player\.|botDirector|projectiles|objective|fixedStep/);
});

test("fixed-step clock owns a bounded catch-up ceiling without variable timestep", async () => {
	const hodClock = await readHodSource("src/app/runtime/NetzachFixedStepClock.js");
	assert.match(hodClock, /maxStepsPerFrame/);
	assert.match(hodClock, /droppedSeconds/);
	assert.match(hodClock, /tiferesStepFunction\(this\.netzachFixedStep\)/);
	assert.doesNotMatch(hodClock, /tiferesStepFunction\(gevurahFrameDelta\)/);
});

test("native scene keeps adaptive framebuffer policy behind one dedicated adapter", async () => {
	const hodScene = await readHodSource("src/render/AwtsmoosNativeScene.js");
	assert.match(hodScene, /new YesodNativeRenderScale/);
	assert.match(hodScene, /renderScaleAuthority:\s*yesodRenderScale/);
	assert.match(hodScene, /yesodRenderScale\.resize\(\)/);
	assert.doesNotMatch(hodScene, /setPixelRatio\(.*devicePixelRatio/);
});
