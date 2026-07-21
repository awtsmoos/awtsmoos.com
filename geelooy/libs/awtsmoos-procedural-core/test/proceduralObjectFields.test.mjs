// B"H
// Boruch Hashem
// Blessed is He
/** Field evidence proves deterministic scalar and vector influence. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const vectorSum = api.createField({
	kind: "add",
	valueType: "vector",
	children: [
		{ kind: "constant", valueType: "vector", parameters: { value: [1, 2, 3] } },
		{ kind: "constant", valueType: "vector", parameters: { value: [4, 5, 6] } }
	]
});
assert.deepEqual(api.sampleField(vectorSum), [5, 7, 9]);

const radial = api.createRadialField({ center: [0, 0, 0], strength: 2, falloff: 0 });
assert.deepEqual(api.sampleField(radial, { position: [1, 0, 0] }), [2, 0, 0]);

const noise = api.createNoiseField({ seed: 42, scale: 0.5 });
const first = api.sampleField(noise, { position: [1.5, 2.5, 3.5], time: 2 });
const second = api.sampleField(noise, { position: [1.5, 2.5, 3.5], time: 2 });
assert.equal(first, second);
assert.ok(first >= -1 && first <= 1);

console.log('B"H | proceduralObjectFields.test passed');
