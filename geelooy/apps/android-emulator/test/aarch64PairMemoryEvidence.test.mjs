//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64PairMemory } from "../core/native/aarch64ExecutePairMemory.js";
import { snapshotAarch64PairMemoryEvidence } from "../core/native/aarch64PairMemoryEvidence.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

const PUBLIC_KEYS = [
	"address", "firstRegister", "firstValue", "instructionAddress", "mnemonic", "mode",
	"registerClass", "secondRegister", "secondValue", "store", "width"
];

/** Proves deferred formatting preserves exact authentic SIMD pair testimony. */
test("authentic Q pair evidence preserves exact frozen public contract", () => {
	const memory = createNativeAnonymousMemory(0x7000n, 0x1000, "pair-evidence");
	const registers = createAarch64Registers({ stackPointer: 0x7000n });
	const first = 0x112233445566778899aabbccddeeff00n;
	const second = 0xffeeddccbbaa99887766554433221100n;
	registers.writeVector(1, first, 128);
	registers.writeVector(0, second, 128);
	executeAarch64PairMemory(decodeAarch64Instruction(0xad0603e1, 0x1000n), registers, memory);
	registers.writeVector(1, 0n, 128);
	registers.writeVector(0, 0n, 128);
	executeAarch64PairMemory(decodeAarch64Instruction(0xad4603e1, 0x1004n), registers, memory);
	const evidence = snapshotAarch64PairMemoryEvidence(registers);
	assert.equal(Object.isFrozen(evidence), true);
	assert.equal(Object.isFrozen(evidence[0]), true);
	assert.deepEqual(Object.keys(evidence[0]), PUBLIC_KEYS);
	assert.deepEqual(
		[evidence[0].mnemonic, evidence[0].address, evidence[0].firstValue, evidence[0].secondValue],
		["stp", "28864", first.toString(), second.toString()]
	);
	assert.deepEqual(
		[evidence[1].mnemonic, evidence[1].firstValue, evidence[1].secondValue],
		["ldp", first.toString(), second.toString()]
	);
});

/** Proves raw private retention becomes exact frozen latest-sixty-four public records. */
test("pair evidence formats latest sixty-four operations oldest to newest", () => {
	const memory = createNativeAnonymousMemory(0x8000n, 0x1000, "pair-bound");
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	const instruction = decodeAarch64Instruction(0xa90007e0, 0x2000n);
	for (let index = 0; index < 70; index += 1) {
		registers.write(0, BigInt(index));
		executeAarch64PairMemory(instruction, registers, memory);
	}
	const evidence = snapshotAarch64PairMemoryEvidence(registers);
	assert.equal(Object.isFrozen(evidence), true);
	assert.equal(evidence.length, 64);
	assert.equal(evidence[0].firstValue, "6");
	assert.equal(evidence[63].firstValue, "69");
	assert.deepEqual(evidence.map(record => Number(record.firstValue)), Array.from({ length: 64 }, (_, index) => index + 6));
	for (const record of evidence) {
		assert.equal(Object.isFrozen(record), true);
		assert.deepEqual(Object.keys(record), PUBLIC_KEYS);
		assert.equal(typeof record.address, "string");
		assert.equal(typeof record.firstValue, "string");
		assert.equal(typeof record.secondValue, "string");
	}
});

/** Proves absent history retains the immutable empty public contract. */
test("pair evidence is empty and immutable before the first transfer", () => {
	const registers = createAarch64Registers({ stackPointer: 0x9000n });
	const evidence = snapshotAarch64PairMemoryEvidence(registers);
	assert.deepEqual(evidence, []);
	assert.equal(Object.isFrozen(evidence), true);
});
