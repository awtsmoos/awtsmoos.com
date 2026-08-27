// B"H
// Boruch Hashem
// Blessed is He
/** Node, animation, and asset evidence proves typed composition across domains. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

assert.equal(api.planSocketConnection({ type: "integer" }, { type: "float" }).compatible, true);
assert.equal(api.planSocketConnection({ type: "float" }, { type: "field<float>" }).conversion, "lift-constant-to-field");
assert.equal(api.planSocketConnection({ type: "shader.surface" }, { type: "shader.volume" }).compatible, false);

const linear = [
	{ time: 0, value: 0, interpolation: "linear" },
	{ time: 1, value: 10, interpolation: "linear" }
];
assert.equal(api.evaluateKeyframeCurve(linear, 0.5), 5);
const action = api.createAction({ channels: [{ propertyReference: { artifactId: "object.one", path: ["position", 0] }, keyframes: linear }] });
assert.equal(action.channels.length, 1);

const generators = new api.AssetGeneratorRegistry();
generators.register("generator.plane", ({ parameters }) => api.buildPlaneGeometry(parameters, "generated-plane"));
const modifiers = api.registerCoreModifierExecutors(new api.ModifierExecutorRegistry());
const generated = api.generateAsset({
	generatorId: "generator.plane",
	parameters: { size: [1, 1], segments: [1, 1] },
	modifierStack: { modifiers: [{ definitionId: api.CORE_WAVE_MODIFIER_ID, parameters: { amplitude: 0.5, frequency: 0, phase: Math.PI / 2 } }] }
}, { generatorRegistry: generators, modifierRegistry: modifiers, time: 0 });
assert.equal(generated.artifact.id.includes("modifier.instance"), true);
assert.ok(generated.artifact.attributes.position.array.every((value, index) => index % 3 !== 2 || Math.abs(value - 0.5) < 1e-12));

console.log('B"H | proceduralObjectNodesAnimationAssets.test passed');
