//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAndroidCallTransitionWitness } from "../core/native/nativeAndroidCallTransitionWitness.js";

const PUBLIC_KEYS = ["mnemonic", "registers", "returnAddress", "source", "sourceRegion", "sourceSpace", "step", "target", "targetRegion", "targetSpace"];

/** Proves lazy formatting preserves exact VM/isolate ABI and public record contracts. */
test("call transition witness preserves VM boundary and isolate testimony", () => {
	const witness = createNativeAndroidCallTransitionWitness();
	const registers = createRegisters();
	witness.observe(event(0x8a76b4n, 0x100303c5cn, 1), registers);
	witness.observe(event(0x100303c60n, 0x100303d00n, 2), registers);
	witness.observe(event(0x100303d04n, 0x91bc78n, 3), registers);
	witness.observe(event(0x2004n, 0x100306a40n, 4), registers);
	witness.observe(event(0x100306a44n, 0x100306b00n, 5), registers);
	witness.observe(event(0x100306b04n, 0x3000n, 6), registers);
	const snapshot = witness.snapshot();
	assert.equal(snapshot.total, 6);
	assert.equal(snapshot.vmBoundaryTransitions.length, 2);
	assert.equal(snapshot.isolateTransitions.length, 3);
	assert.deepEqual(snapshot.vmBoundaryTransitions[0].registers, expectedRegisters());
	assert.deepEqual(snapshot.vmBoundaryTransitions[1].registers, expectedRegisters());
	assert.equal(snapshot.tail[1].registers, null);
	assert.deepEqual(snapshot.isolateTransitions[0].registers, expectedRegisters());
	assert.deepEqual(Object.keys(snapshot.tail[0]), PUBLIC_KEYS);
	assert.equal(typeof snapshot.tail[0].source, "string");
	assert.equal(typeof snapshot.tail[0].target, "string");
	assert.equal(Object.isFrozen(snapshot), true);
	assert.equal(Object.isFrozen(snapshot.tail), true);
	assert.equal(Object.isFrozen(snapshot.tail[0]), true);
	assert.equal(Object.isFrozen(snapshot.vmBoundaryTransitions[0].registers), true);
});

/** Proves fixed rings retain newest evidence oldest-to-newest without changing totals. */
test("call transition witness fixed tail ring preserves newest order", () => {
	const witness = createNativeAndroidCallTransitionWitness();
	for (let index = 0; index < 80; index += 1) {
		witness.observe(event(0x2000n + BigInt(index * 4), 0x3000n, index), null);
	}
	const snapshot = witness.snapshot();
	assert.equal(snapshot.total, 80);
	assert.equal(snapshot.tail.length, 32);
	assert.equal(snapshot.tail[0].step, 48);
	assert.equal(snapshot.tail[31].step, 79);
	assert.equal(Object.isFrozen(snapshot.tail), true);
	assert.equal(snapshot.counts.engineToEngine, 80);
});

function createRegisters() {
	const registers = createAarch64Registers({ programCounter: 0x1000n, stackPointer: 0x8800n });
	for (let index = 0; index < 8; index += 1) registers.write(index, BigInt(100 + index), 64, "zero");
	registers.write(15, 115n, 64, "zero");
	registers.write(26, 126n, 64, "zero");
	registers.write(30, 130n, 64, "zero");
	return registers;
}

function expectedRegisters() {
	return {
		sp: "34816", x0: "100", x1: "101", x2: "102", x3: "103", x4: "104", x5: "105",
		x6: "106", x7: "107", x15: "115", x26: "126", x27: "0", x28: "0", x29: "0", x30: "130"
	};
}

function event(source, target, step) {
	return Object.freeze({ mnemonic: "blr", returnAddress: (source + 4n).toString(), source: source.toString(), step, target: target.toString() });
}
