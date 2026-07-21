// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicVisualContractTest
 * @description
 * The Awtsmoos tests raw WebGL2, kinetic wake, adaptive restoration, source
 * resonance, and graceful stillness across the Awtsmoos.com visual chain.
 */
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const visualsRoot = new URL("../", import.meta.url);
const coreRoot = new URL(
	"../../../../../../libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/",
	import.meta.url
);
const publicIndex = await readCore("index.js");
const proceduralScene = await readCore("proceduralScene.js");
const sceneFrame = await readCore("sceneFrame.js");
const runtime = await readCore("sceneRuntime.js");
const battery = await readCore("batteryHint.js");
const resources = await readCore("sceneResources.js");
const lifecycle = await readCore("sceneLifecycle.js");
const context = await readCore("context.js");
const profile = await readCore("performanceProfile.js");
const particles = await readCore("particleLayout.js");
const kinetic = await readCore("kineticField.js");
const particleShader = await readCore("shaders/particles.js");
const interaction = await readCore("interactionField.js");
const nebula = await readCore("shaders/nebula.js");
const resonance = await readVisual("postResonanceObserver.js");
const router = await readVisual("resonanceEventRouter.js");

assert.match(publicIndex, /ProceduralCosmicScene/);
assert.match(proceduralScene, /KineticField/);
assert.match(sceneFrame, /pointerVelocity/);
assert.match(sceneFrame, /scrollVelocity/);
assert.match(context, /getContext\((['"])webgl2\1/);
assert.match(context, /maximumPixelRatio/);
assert.match(lifecycle, /webglcontextlost/);
assert.match(lifecycle, /visibilitychange/);
assert.match(profile, /prefers-reduced-motion/);
assert.match(profile, /deviceMemory/);
assert.match(profile, /hardwareConcurrency/);
assert.match(profile, /saveData/);
assert.match(runtime, /FrameBudget/);
assert.match(runtime, /reduceSceneProfile/);
assert.match(runtime, /applyBatteryHint/);
assert.match(battery, /getBattery/);
assert.match(resources, /applyProfile/);
assert.match(particles, /SeededRandom/);
assert.match(kinetic, /setPointerAway/);
assert.match(kinetic, /scrollVelocity/);
assert.match(particleShader, /uPointerVelocity/);
assert.match(particleShader, /uKineticEnergy/);
assert.match(particleShader, /vStreak/);
assert.match(interaction, /expiresAt/);
assert.match(nebula, /domainWarp/);
assert.match(nebula, /starBand/);
assert.match(nebula, /uKineticEnergy/);
assert.match(resonance, /ResizeObserver/);
assert.match(router, /pointerleave/);
assert.match(router, /setPointerAway/);
const moduleNames = await readdir(coreRoot);
assert.ok(moduleNames.length >= 14, "procedural core remains split into focused modules");
console.log('B"H cosmic visual contracts pass.');

async function readVisual(relativePath) {
	return readFile(new URL(relativePath, visualsRoot), "utf8");
}

async function readCore(relativePath) {
	return readFile(new URL(relativePath, coreRoot), "utf8");
}
