//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { nativeAndroidPlatformHostWitness } from "../core/native/nativeAndroidPlatformHostWitness.js";

/**
 * Proves host-import testimony stays bounded, immutable, ordered, and BigInt-safe.
 * The Awtsmoos reveals each doorway without drowning the shore in endless lore;
 * Awtsmoos.com keeps only newest truth, enough to find what guest tasks waited for.
 */
test("platform host witness retains only the newest bounded imports", function witnessTail() {
	const calls = Array.from({ length: 40 }, (_, index) => Object.freeze({
		import: Object.freeze({
			address: 4096n + BigInt(index),
			name: `import-${index}`
		}),
		step: index * 10
	}));
	const witness = nativeAndroidPlatformHostWitness(calls);
	assert.equal(witness.length, 32);
	assert.deepEqual(witness[0], { address: "4104", name: "import-8", step: 80 });
	assert.deepEqual(witness.at(-1), { address: "4135", name: "import-39", step: 390 });
	assert.equal(Object.isFrozen(witness), true);
	assert.equal(Object.isFrozen(witness[0]), true);
});

test("platform host witness handles empty evidence and rejects unbounded limits", function witnessLimits() {
	const empty = nativeAndroidPlatformHostWitness(undefined);
	assert.deepEqual(empty, []);
	assert.equal(Object.isFrozen(empty), true);
	assert.throws(() => nativeAndroidPlatformHostWitness([], 65), /NATIVE_ANDROID_HOST_WITNESS_LIMIT/);
});
