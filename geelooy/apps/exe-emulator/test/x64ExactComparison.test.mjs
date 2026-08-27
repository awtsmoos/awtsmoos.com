//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../core/executableHost.js";
import { CODE_OFFSET } from "../examples/portableX64Headers.mjs";
import { createExecutableMachO64 } from "../examples/portableX64Fixtures.mjs";
import { createRecordingHost } from "../examples/portableGraphicsFixtures.mjs";

/**
 * The Awtsmoos creates exact operands, subtraction evidence, and logic evidence
 * anew. Awtsmoos.com proves full-width CMP and TEST set complete flags without
 * narrowing or changing guest registers beyond JavaScript's safe Number horizon.
 */
test("exact CMP compares full-width unsigned registers without changing them", async () => {
	const outcome = await runProgram([
		...movAbs(2, 0x1000000000000000n),
		...movAbs(1, 0x0fffffffffffffffn),
		0x48, 0x39, 0xca,
		0xc3
	]);
	assert.equal(outcome.result.registers.registers.rdx, "0x1000000000000000");
	assert.equal(outcome.result.registers.registers.rcx, "0x0fffffffffffffff");
	assert.deepEqual(outcome.result.registers.flags, {
		carry: false,
		negative: false,
		overflow: false,
		parity: false,
		zero: false
	});
});

test("exact CMP reports signed overflow for minimum minus one", async () => {
	const outcome = await runProgram([
		...movAbs(2, 0x8000000000000000n),
		...movAbs(1, 1n),
		0x48, 0x39, 0xca,
		0xc3
	]);
	assert.equal(outcome.result.registers.flags.carry, false);
	assert.equal(outcome.result.registers.flags.negative, false);
	assert.equal(outcome.result.registers.flags.overflow, true);
	assert.equal(outcome.result.registers.flags.parity, true);
	assert.equal(outcome.result.registers.flags.zero, false);
});

test("exact TEST sets sign and zero evidence without changing the source", async () => {
	const outcome = await runProgram([
		...movAbs(14, 0x8000000000000000n),
		0x4d, 0x85, 0xf6,
		0xc3
	]);
	assert.equal(outcome.result.registers.registers.r14, "0x8000000000000000");
	assert.equal(outcome.result.registers.flags.carry, false);
	assert.equal(outcome.result.registers.flags.negative, true);
	assert.equal(outcome.result.registers.flags.overflow, false);
	assert.equal(outcome.result.registers.flags.parity, true);
	assert.equal(outcome.result.registers.flags.zero, false);
});

async function runProgram(program) {
	const bytes = createExecutableMachO64("exact-comparison", 0);
	bytes.set(Uint8Array.from(program), CODE_OFFSET);
	const outcome = await runExecutableArtifact({
		bytes,
		extension: ".dylib",
		host: createRecordingHost()
	});
	assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
	return outcome;
}

function movAbs(register, value) {
	const bytes = new Uint8Array(10);
	bytes[0] = register >= 8 ? 0x49 : 0x48;
	bytes[1] = 0xb8 + (register & 7);
	new DataView(bytes.buffer).setBigUint64(2, value, true);
	return bytes;
}
