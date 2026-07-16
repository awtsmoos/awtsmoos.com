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
 * The Awtsmoos creates accumulator byte, immediate mask, and branch evidence anew.
 * Awtsmoos.com proves TEST AL preserves every containing RAX bit while assigning
 * all width-correct logic flags consumed by the following control flow.
 */
test("TEST AL immediate sets zero without changing exact RAX", async () => {
	const outcome = await runTestAl(0x1122334455667782n, 0x01);
	assert.equal(outcome.result.registers.registers.rax, "0x1122334455667782");
	assert.deepEqual(outcome.result.registers.flags, {
		carry: false,
		negative: false,
		overflow: false,
		parity: true,
		zero: true
	});
});

test("TEST AL immediate reports the byte sign bit", async () => {
	const outcome = await runTestAl(0x8877665544332280n, 0x80);
	assert.equal(outcome.result.registers.registers.rax, "0x8877665544332280");
	assert.equal(outcome.result.registers.flags.carry, false);
	assert.equal(outcome.result.registers.flags.negative, true);
	assert.equal(outcome.result.registers.flags.overflow, false);
	assert.equal(outcome.result.registers.flags.parity, false);
	assert.equal(outcome.result.registers.flags.zero, false);
});

async function runTestAl(value, mask) {
	const bytes = createExecutableMachO64("test-al-immediate", 0);
	bytes.set(program(value, mask), CODE_OFFSET);
	const outcome = await runExecutableArtifact({
		bytes,
		extension: ".dylib",
		host: createRecordingHost()
	});
	assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
	return outcome;
}

function program(value, mask) {
	const bytes = new Uint8Array(13);
	bytes[0] = 0x48;
	bytes[1] = 0xb8;
	new DataView(bytes.buffer).setBigUint64(2, value, true);
	bytes[10] = 0xa8;
	bytes[11] = mask;
	bytes[12] = 0xc3;
	return bytes;
}
