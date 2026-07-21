// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicFeedSceneContractTest
 * @description
 * The Awtsmoos verifies a raw, recoverable, adaptive WebGL2 vessel whose
 * Awtsmoos.com meaning survives when the visual context does not.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "geelooy/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed";
const read = (path) => readFileSync(path, "utf8");
const context = read(join(root, "context.js"));
const scene = read(join(root, "proceduralScene.js"));
const lifecycle = read(join(root, "sceneLifecycle.js"));
const runtime = read(join(root, "sceneRuntime.js"));
const profile = read(join(root, "performanceProfile.js"));
const particles = read(join(root, "particleLayout.js"));
const nebula = read(join(root, "shaders/nebula.js"));
const pageAdapter = read(
	"geelooy/scripts/awtsmoos/social/home/visuals/cosmicFeedScene.js"
);

assert.ok(context.includes('"webgl2"'));
for (const token of ["webglcontextlost", "webglcontextrestored"]) {
	assert.ok(lifecycle.includes(token), `context lifecycle missing ${token}`);
}
for (const token of ["suspendForContextLoss", "restoreContext"]) {
	assert.ok(scene.includes(token), `scene missing ${token}`);
}
for (const token of [
	"deviceMemory",
	"hardwareConcurrency",
	"saveData",
	"prefers-reduced-motion"
]) {
	assert.ok(profile.includes(token), `performance profile missing ${token}`);
}
for (const token of ["FrameBudget", "reduceProfile", "getBattery"]) {
	assert.ok(runtime.includes(token), `adaptive runtime missing ${token}`);
}
for (const token of [
	"positionPhase",
	"motionFamily",
	"SeededRandom",
	"sideBias"
]) {
	assert.ok(particles.includes(token), `particle layout missing ${token}`);
}
for (const token of ["fbm", "warp", "uFeedBounds", "uInteractionColor"]) {
	assert.ok(nebula.includes(token), `nebula shader missing ${token}`);
}
assert.ok(pageAdapter.includes("cosmicFallback"));
assert.ok(pageAdapter.includes("canvas.hidden = true"));

for (const file of walk(root)) {
	const source = read(file);
	assert.match(source.split("\n")[0], /B"H/);
	assert.ok(source.split("\n").length - 1 <= 120, `${file} exceeds 120 lines`);
	assert.doesNotMatch(source, /from\s+["'](?:three|babylon|pixi|regl|phaser)/i);
}

console.log('B"H cosmicFeedSceneContract.test passed');

function walk(directory) {
	return readdirSync(directory).flatMap((name) => {
		const path = join(directory, name);
		return statSync(path).isDirectory() ? walk(path) : path.endsWith(".js") ? [path] : [];
	});
}
