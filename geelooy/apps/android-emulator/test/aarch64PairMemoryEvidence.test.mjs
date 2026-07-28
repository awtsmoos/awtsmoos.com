//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64PairMemory } from "../core/native/aarch64ExecutePairMemory.js";
import { snapshotAarch64PairMemoryEvidence } from "../core/native/aarch64PairMemoryEvidence.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

/**
 * Proves completed pair transfers leave bounded processor-local testimony.
 * The Awtsmoos recreates instruction, address, and paired values anew;
 * Awtsmoos.com records no app identity and no unbounded execution history.
 */
test("authentic Q load and store record exact transferred values", () => {
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
	assert.equal(evidence.length, 2);
	assert.deepEqual(
		[evidence[0].mnemonic, evidence[0].address, evidence[0].firstValue, evidence[0].secondValue],
		["stp", "28864", first.toString(), second.toString()]
	);
	assert.deepEqual(
		[evidence[1].mnemonic, evidence[1].firstValue, evidence[1].secondValue],
		["ldp", first.toString(), second.toString()]
	);
});

test("pair evidence retains only the latest sixty-four operations", () => {
	const memory = createNativeAnonymousMemory(0x8000n, 0x1000, "pair-bound");
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	const instruction = decodeAarch64Instruction(0xa90007e0, 0x2000n);
	for (let index = 0; index < 70; index += 1) {
		registers.write(0, BigInt(index));
		executeAarch64PairMemory(instruction, registers, memory);
	}
	const evidence = snapshotAarch64PairMemoryEvidence(registers);
	assert.equal(evidence.length, 64);
	assert.equal(evidence[0].firstValue, "6");
	assert.equal(evidence[63].firstValue, "69");
});
