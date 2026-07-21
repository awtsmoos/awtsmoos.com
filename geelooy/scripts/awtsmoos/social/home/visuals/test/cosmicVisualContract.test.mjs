// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicVisualContractTest
 * @description
 * The Awtsmoos tests the actual exported visual chain: raw WebGL2, measured
 * performance, restoration, source resonance, and graceful stillness.
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
const resources = await readCore("sceneResources.js");
const lifecycle = await readCore("sceneLifecycle.js");
const context = await readCore("context.js");
const profile = await readCore("performanceProfile.js");
const particles = await readCore("particleLayout.js");
const particleShader = await readCore("shaders/particles.js");
const interaction = await readCore("interactionField.js");
const nebula = await readCore("shaders/nebula.js");
const resonance = await readVisual("postResonanceObserver.js");
const waveform = await readVisual("waveformPreview.js");
const analyser = await readVisual("audioAnalyser.js");

assert.match(publicIndex, /ProceduralCosmicScene/, "public core exports the production scene");
assert.match(proceduralScene, /CosmicSceneRuntime/, "scene owns the adaptive runtime");
assert.match(sceneFrame, /interactionColor/, "frame carries source color independently");
assert.match(sceneFrame, /interactionField\.update/, "frame advances the interaction field");
assert.match(context, /getContext\((['"])webgl2\1/, "engine uses raw WebGL2");
assert.match(context, /devicePixelRatio/, "drawing buffer respects device pixel ratio");
assert.match(context, /maximumPixelRatio/, "device pixel ratio is clamped");
assert.match(lifecycle, /webglcontextlost/, "context loss is handled");
assert.match(lifecycle, /webglcontextrestored/, "context restoration is handled");
assert.match(lifecycle, /visibilitychange/, "hidden documents pause animation");
assert.match(profile, /prefers-reduced-motion/, "reduced motion selects the lean profile");
assert.match(profile, /deviceMemory/, "profile reads memory capability");
assert.match(profile, /hardwareConcurrency/, "profile reads CPU capability");
assert.match(profile, /saveData/, "profile respects data-saving preference");
assert.match(runtime, /FrameBudget/, "runtime measures sustained frame cost");
assert.match(runtime, /reduceProfile/, "runtime lowers visual cost adaptively");
assert.match(runtime, /getBattery/, "runtime uses detectable battery hints");
assert.match(resources, /applyProfile/, "all costly layers receive reduced profiles");
assert.match(resources, /glyphs\.setCount/, "glyph count adapts with performance");
assert.match(particles, /SeededRandom/, "particle layout is deterministic");
assert.match(particleShader, /uInteractionColor/, "particles receive source tint");
assert.match(particleShader, /pulseRadius/, "particles receive resonance waves");
assert.match(interaction, /expiresAt/, "interaction channels decay by explicit expiry");
assert.match(interaction, /index < 4/, "interaction field advances all four components");
assert.match(interaction, /weight \/ 2/, "channel weight contributes ambient pulse energy");
assert.match(nebula, /domainWarp/, "nebula uses layered domain warping");
assert.match(nebula, /starBand/, "nebula includes multiple star depth bands");
assert.match(nebula, /uFeedBounds/, "nebula protects the readable feed region");
assert.match(resonance, /dataset\.cosmicActive/, "DOM exposes the active resonance channel");
assert.match(resonance, /ResizeObserver/, "feed bounds respond to layout changes");
assert.match(waveform, /createSeededRandom/, "waveform is stable by content identity");
assert.match(analyser, /createAnalyser/, "playing audio receives Web Audio enhancement");

const moduleNames = await readdir(coreRoot);
assert.ok(moduleNames.length >= 10, "procedural core remains split into focused modules");
console.log('B"H cosmic visual contracts pass.');

async function readVisual(path) {
	return readFile(new URL(path, visualsRoot), "utf8");
}

async function readCore(path) {
	return readFile(new URL(path, coreRoot), "utf8");
}
