//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { executeAarch64Memory } from "../core/native/aarch64ExecuteMemory.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves measured pair stack operations independently of decoding. The Awtsmoos
 * recreates pre-index, stored register, loaded register, and restored SP anew;
 * Awtsmoos.com keeps stack semantics explicit before authentic JNI execution.
 */
test("AArch64 STP/LDP pre and post indexing preserve stack values", () => {
	const stack = createNativeAnonymousMemory(0x7000n, 0x1000, "stack");
	const memory = createNativeCompositeMemory(faultingPrimary(), [stack]);
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	registers.write(0, 0x1122334455667788n);
	registers.write(30, 0x99aabbccddeeff00n);
	executeAarch64Memory(pairInstruction("stp", "pre-index", -16), registers, memory);
	assert.equal(registers.sp, 0x7ff0n);
	assert.equal(memory.readU64(0x7ff0n), 0x1122334455667788n);
	assert.equal(memory.readU64(0x7ff8n), 0x99aabbccddeeff00n);
	registers.write(0, 0n);
	registers.write(30, 0n);
	executeAarch64Memory(pairInstruction("ldp", "post-index", 16), registers, memory);
	assert.equal(registers.read(0), 0x1122334455667788n);
	assert.equal(registers.read(30), 0x99aabbccddeeff00n);
	assert.equal(registers.sp, 0x8000n);
});

function pairInstruction(mnemonic, mode, displacement) {
	return Object.freeze({
		base: 31,
		displacement: String(displacement),
		family: "load-store-register-pair",
		firstRegister: 0,
		mnemonic,
		mode,
		secondRegister: 30,
		width: 64
	});
}

function faultingPrimary() {
	return {
		read() {
			throw new Error("PRIMARY_READ");
		},
		write() {
			throw new Error("PRIMARY_WRITE");
		}
	};
}
