// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals one identity beneath reordered keys while preserving
 * every distinction that carries meaning across machines and generations.
 */

import assert from "node:assert/strict";

import * as rootApi from "../src/index.js";
import * as proceduralApi from "../src/core/proceduralObject/index.js";

assert.equal(rootApi.hashCanonicalValue, proceduralApi.hashCanonicalValue);
assert.equal(
	proceduralApi.hashCanonicalValue({ second: 2, first: 1 }),
	proceduralApi.hashCanonicalValue({ first: 1, second: 2 })
);
assert.equal(
	proceduralApi.hashCanonicalValue({ word: "שלום🌌" }),
	proceduralApi.hashCanonicalValue({ word: "שלום🌌" })
);
assert.notEqual(
	proceduralApi.hashCanonicalValue(-0),
	proceduralApi.hashCanonicalValue(0)
);
assert.notEqual(
	proceduralApi.hashCanonicalValue(Number.NaN),
	proceduralApi.hashCanonicalValue(null)
);
assert.notEqual(
	proceduralApi.hashCanonicalValue(Array(1)),
	proceduralApi.hashCanonicalValue([undefined])
);

const typed = proceduralApi.normalizeCanonicalValue(
	new Float32Array([1, Number.NaN, -0])
);
assert.equal(typed.type, "typed-array");
assert.equal(typed.name, "Float32Array");
assert.equal(typed.values[1].value, "nan");
assert.equal(typed.values[2].value, "-0");

const buffer = proceduralApi.normalizeCanonicalValue(
	new Uint8Array([0, 1, 255]).buffer
);
assert.deepEqual(buffer, {
	type: "array-buffer",
	hex: "0001ff"
});
assert.deepEqual(
	proceduralApi.normalizeCanonicalValue(9007199254740993n),
	{ type: "bigint", value: "9007199254740993" }
);

const cyclic = {};
cyclic.self = cyclic;
assert.throws(
	() => proceduralApi.normalizeCanonicalValue(cyclic),
	/cycles/
);
assert.throws(
	() => proceduralApi.normalizeCanonicalValue(new Date()),
	/Unsupported canonical object/
);
assert.throws(
	() => proceduralApi.normalizeCanonicalValue({ get hidden() { return 1; } }),
	/data property/
);
const symbolKeyed = { visible: true };
symbolKeyed[Symbol("hidden")] = true;
assert.throws(
	() => proceduralApi.normalizeCanonicalValue(symbolKeyed),
	/symbol keys/
);
assert.throws(
	() => proceduralApi.normalizeCanonicalValue({ a: { b: {} } }, { maxDepth: 1 }),
	/maximum depth/
);

const frozen = proceduralApi.normalizeCanonicalValue({ nested: [1, 2, 3] });
assert.equal(Object.isFrozen(frozen), true);
assert.equal(Object.isFrozen(frozen.entries), true);
assert.equal(Object.isFrozen(frozen.entries[0][1]), true);

console.log('B"H | proceduralObjectFoundationCanonical.test passed');
