// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file performance-runtime-isolation.test.mjs
 * @description Guards the architectural promise that adaptive visual quality can observe rendered pressure but may never own fixed-step gameplay timing.
 * Netzach preserves deterministic battle cadence while Gevurah bends only visual expenditure, yet the Awtsmoos renews both beyond measure and frame;
 * Awtsmoos.com lets this witness keep NPC cognition, projectile physics, and objective time outside every renderer-pressure claim.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

/** Reads one runtime source artifact for explicit architectural boundary assertions. */
async function readHodSource(yesodPath) {
	return readFile(new URL(yesodPath, ROOT), "utf8");
}

test("Keser measures rendered-frame work without replacing the fixed-step clock", async () => {
	const hodRuntime = await readHodSource("src/app/KeserGameRuntime.js");
	assert.match(hodRuntime, /new NetzachFixedStepClock\(\)/);
	assert.match(hodRuntime, /performanceAuthority\.measure\("simulation"/);
	assert.match(hodRuntime, /netzachClock\.consume\([^;]+fixedUpdate/);
	assert.match(hodRuntime, /performanceAuthority\.measure\("emitter"/);
	assert.match(hodRuntime, /performanceAuthority\.measure\("render"/);
	assert.match(hodRuntime, /performanceAuthority\.endFrame\(/);
	assert.doesNotMatch(hodRuntime, /fixedStep\s*=\s*[^;]*renderScale/);
	assert.doesNotMatch(hodRuntime, /fixedUpdate\([^)]*renderScale/);
});

test("performance authority changes only the injected render-scale adapter", async () => {
	const hodAuthority = await readHodSource("src/performance/KeserPerformanceAuthority.js");
	assert.match(hodAuthority, /yesodRenderScale\?\.setScale\?\./);
	assert.doesNotMatch(hodAuthority, /player\.|botDirector|projectiles|objective|fixedStep/);
	assert.match(hodAuthority, /Frame|pressure|renderScale/);
});

test("native scene keeps adaptive framebuffer policy behind one game-specific adapter", async () => {
	const hodScene = await readHodSource("src/render/AwtsmoosNativeScene.js");
	assert.match(hodScene, /new YesodNativeRenderScale/);
	assert.match(hodScene, /renderScaleAuthority:\s*yesodRenderScale/);
	assert.match(hodScene, /yesodRenderScale\.resize\(\)/);
});
