//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves nested guest-memory routing and cold ownership without probing bytes.
 * The Awtsmoos renews primary, auxiliary, and hidden nested shore in one rhyme;
 * Awtsmoos.com keeps unowned addresses unclaimed while routing stays in time.
 */
test("native composite routes, nests, and describes concrete ownership", () => {
	const primary = createNativeAnonymousMemory(0x1000n, 0x100, "inner-primary");
	const innerAux = createNativeAnonymousMemory(0x2000n, 0x100, "inner-aux");
	const outerAux = createNativeAnonymousMemory(0x3000n, 0x100, "outer-aux");
	const inner = createNativeCompositeMemory(primary, [innerAux], "inner");
	const outer = createNativeCompositeMemory(inner, [outerAux], "outer");
	primary.write(0x1008n, Uint8Array.of(0x11));
	innerAux.write(0x2008n, Uint8Array.of(0x22));
	outerAux.write(0x3008n, Uint8Array.of(0x33));
	assert.equal(outer.read(0x1008n, 1)[0], 0x11);
	assert.equal(outer.read(0x2008n, 1)[0], 0x22);
	assert.equal(outer.read(0x3008n, 1)[0], 0x33);
	assert.equal(outer.contains(0x1008n, 1), true);
	assert.equal(outer.contains(0x7000n, 1), false);
	assert.deepEqual(
		outer.describeAddress(0x1008n, 1)?.path,
		["outer", "inner", "inner-primary"]
	);
	assert.deepEqual(
		outer.describeAddress(0x2008n, 1)?.path,
		["outer", "inner", "inner-aux"]
	);
	assert.deepEqual(
		outer.describeAddress(0x3008n, 1)?.path,
		["outer", "outer-aux"]
	);
	assert.equal(outer.describeAddress(0x7000n, 1), null);
	assert.throws(() => outer.read(0x7000n, 1));
});

test("native composite rejects overlapping auxiliary regions", () => {
	const primary = createNativeAnonymousMemory(0x1000n, 0x100, "primary");
	const left = createNativeAnonymousMemory(0x4000n, 0x100, "left");
	const right = createNativeAnonymousMemory(0x4080n, 0x100, "right");
	assert.throws(
		() => createNativeCompositeMemory(primary, [left, right]),
		error => error?.code === "NATIVE_ANONYMOUS_OVERLAP"
	);
});
