// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicFeedSceneContractTest
 * @description
 * The Awtsmoos verifies one raw, recoverable, adaptive, kinetic WebGL2 vessel.
 * Awtsmoos.com meaning survives context loss while costly layers lower together.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "geelooy/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed";
const read = path => readFileSync(path, "utf8");
const context = read(join(root, "context.js"));
const scene = read(join(root, "proceduralScene.js"));
const lifecycle = read(join(root, "sceneLifecycle.js"));
const runtime = read(join(root, "sceneRuntime.js"));
const battery = read(join(root, "batteryHint.js"));
const profile = read(join(root, "performanceProfile.js"));
const particles = read(join(root, "particleLayout.js"));
const particleField = read(join(root, "particleField.js"));
const kinetic = read(join(root, "kineticField.js"));
const resources = read(join(root, "sceneResources.js"));
const nebula = read(join(root, "shaders/nebula.js"));
const particleShader = read(join(root, "shaders/particles.js"));
const pageAdapter = read("geelooy/scripts/awtsmoos/social/home/visuals/cosmicFeedScene.js");

assert.ok(context.includes('"webgl2"'));
for (const token of ["webglcontextlost", "webglcontextrestored"]) {
	assert.ok(lifecycle.includes(token), `context lifecycle missing ${token}`);
}
for (const token of ["suspendForContextLoss", "restoreContext", "KineticField"]) {
	assert.ok(scene.includes(token), `scene missing ${token}`);
}
for (const token of ["deviceMemory", "hardwareConcurrency", "saveData", "prefers-reduced-motion"]) {
	assert.ok(profile.includes(token), `performance profile missing ${token}`);
}
for (const token of ["FrameBudget", "reduceProfile", "applyBatteryHint"]) {
	assert.ok(runtime.includes(token), `adaptive runtime missing ${token}`);
}
assert.ok(battery.includes("getBattery"), "battery hint owns optional battery detection");
assert.ok(resources.includes("applyProfile"), "resources must apply complete profiles");
assert.ok(runtime.includes("reduceSceneProfile"), "runtime must lower all costly layers");
for (const token of ["positionPhase", "motionFamily", "SeededRandom", "sideBias"]) {
	assert.ok(particles.includes(token), `particle layout missing ${token}`);
}
for (const token of ["pointerVelocity", "scrollVelocity", "energy", "setPointerAway"]) {
	assert.ok(kinetic.includes(token), `kinetic field missing ${token}`);
}
for (const token of ["uPointerVelocity", "uScrollVelocity", "uKineticEnergy"]) {
	assert.ok(particleShader.includes(token), `particle shader missing ${token}`);
	assert.ok(particleField.includes(token), `particle upload missing ${token}`);
}
for (const token of ["fbm", "domainWarp", "uFeedBounds", "uInteractionColor", "uKineticEnergy"]) {
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
	return readdirSync(directory).flatMap(name => {
		const path = join(directory, name);
		return statSync(path).isDirectory() ? walk(path) : path.endsWith(".js") ? [path] : [];
	});
}
