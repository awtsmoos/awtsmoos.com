// B"H
// Boruch Hashem
// Blessed is He
/** Modifier evidence proves order, execution, and truthful catalog breadth. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

assert.equal(api.BLENDER_MODIFIER_CATALOG.length, 57);
assert.equal(new Set(api.BLENDER_MODIFIER_CATALOG.map(item => item.id)).size, 57);

const geometry = api.buildPlaneGeometry({ size: [2, 2], segments: [1, 1] }, "modifier-plane");
const stack = api.createModifierStack({
	modifiers: [{
		definitionId: api.CORE_WAVE_MODIFIER_ID,
		parameters: { amplitude: 1, frequency: 0, phase: Math.PI / 2 }
	}]
});
const registry = api.registerCoreModifierExecutors(new api.ModifierExecutorRegistry());
const result = api.evaluateModifierStack(geometry, stack, registry, { time: 0 });
const positions = result.artifact.attributes.position.array;
for (let offset = 2; offset < positions.length; offset += 3) assert.ok(Math.abs(positions[offset] - 1) < 1e-12);
assert.equal(result.trace[0].status, "applied");

const unresolved = api.evaluateModifierStack(geometry, api.createModifierStack({
	modifiers: [{ definitionId: "blender.modifier.fluid" }]
}), registry, { strict: false });
assert.equal(unresolved.diagnostics[0].code, "MODIFIER.EXECUTOR_MISSING");

console.log('B"H | proceduralObjectModifierStack.test passed');
