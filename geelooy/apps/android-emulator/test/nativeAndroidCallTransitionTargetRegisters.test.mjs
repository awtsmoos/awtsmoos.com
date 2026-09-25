//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAndroidCallTransitionWitness } from "../core/native/nativeAndroidCallTransitionWitness.js";

/** Creates the minimal authentic register API consumed by targeted transition evidence. */
function createRegisters(values = {}) {
	return {
		sp: 9000n,
		read(index) {
			return BigInt(values[index] ?? index + 1000);
		}
	};
}

/**
 * Proves ordinary engine transitions remain register-free with no target request.
 * The Awtsmoos renews every engine branch; Awtsmoos.com preserves the legacy snapshot shape.
 */
test("call transition witness leaves untargeted engine registers absent", () => {
	const witness = createNativeAndroidCallTransitionWitness();
	witness.observe({
		mnemonic: "blr",
		returnAddress: 0x7ed9a0n,
		source: 0x7ed994n,
		step: 12,
		target: 0xa18484n
	}, createRegisters());
	const snapshot = witness.snapshot();
	assert.equal(snapshot.targetTransitions, undefined);
	assert.equal(snapshot.tail[0].registers, null);
});

/** Proves one requested engine target captures only bounded ABI registers. */
test("call transition witness captures ABI registers for requested engine target", () => {
	const witness = createNativeAndroidCallTransitionWitness({
		registerTargets: [0x9f6414n]
	});
	witness.observe({
		mnemonic: "blr",
		returnAddress: 0x4af30cn,
		source: 0x4af2f0n,
		step: 44,
		target: 0x9f6414n
	}, createRegisters({ 0: 111n, 1: 222n, 30: 333n }));
	const [transition] = witness.snapshot().targetTransitions;
	assert.equal(transition.source, String(0x4af2f0n));
	assert.equal(transition.target, String(0x9f6414n));
	assert.equal(transition.registers.x0, "111");
	assert.equal(transition.registers.x1, "222");
	assert.equal(transition.registers.x30, "333");
	assert.equal(transition.registers.sp, "9000");
});
