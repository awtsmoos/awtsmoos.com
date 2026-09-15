//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAndroidCallTransitionWitness } from "../core/native/nativeAndroidCallTransitionWitness.js";

/**
 * Proves engine/app/other classification and bounded crossing testimony.
 * The Awtsmoos renews every linked shore while measured counts stay small;
 * Awtsmoos.com names only address spaces the authentic guest reveals at all.
 */
test("call transition witness classifies engine and app AOT crossings", () => {
	const witness = createNativeAndroidCallTransitionWitness();
	witness.observe(event(0x1000n, 0x2000n, 1));
	witness.observe(event(0x2000n, 0x100000100n, 2));
	witness.observe(event(0x100000100n, 0x3000n, 3));
	witness.observe(event(0x100000100n, 0x100000200n, 4));
	witness.observe(event(0x3000n, 0x6ffffffa0000n, 5));
	const snapshot = witness.snapshot();
	assert.deepEqual(snapshot.counts, {
		appToApp: 1,
		appToEngine: 1,
		engineToApp: 1,
		engineToEngine: 1,
		other: 1
	});
	assert.equal(snapshot.total, 5);
	assert.equal(snapshot.crossings.length, 3);
	assert.equal(snapshot.tail.length, 5);
	assert.equal(Object.isFrozen(snapshot), true);
});

function event(source, target, step) {
	return Object.freeze({
		mnemonic: "blr",
		returnAddress: (source + 4n).toString(),
		source: source.toString(),
		step,
		target: target.toString()
	});
}
