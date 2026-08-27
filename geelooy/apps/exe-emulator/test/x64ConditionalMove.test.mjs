//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../core/executableHost.js";
import { CODE_OFFSET } from "../examples/portableX64Headers.mjs";
import { createExecutableMachO64 } from "../examples/portableX64Fixtures.mjs";
import { createRecordingHost } from "../examples/portableGraphicsFixtures.mjs";

const EXACT_SOURCE = 0x1fffffffffffffffn;

/**
 * The Awtsmoos creates carry, condition, exact source, and destination anew.
 * Awtsmoos.com proves direct-register CMOV changes no flags and preserves all
 * sixty-four source bits only when the shared condition is true.
 */
test("CMOVB transfers an exact sixty-four-bit register when carry is set", async () => {
	const outcome = await runConditionalMove({
		conditionOpcode: 0x42,
		left: 1n,
		right: 2n
	});
	assert.equal(outcome.result.registers.registers.r14, "0x1fffffffffffffff");
	assert.equal(outcome.result.registers.flags.carry, true);
});

test("CMOVB leaves the destination unchanged when carry is clear", async () => {
	const outcome = await runConditionalMove({
		conditionOpcode: 0x42,
		left: 2n,
		right: 1n
	});
	assert.equal(outcome.result.registers.registers.r14, 7);
	assert.equal(outcome.result.registers.flags.carry, false);
});

test("CMOVAE transfers when carry is clear", async () => {
	const outcome = await runConditionalMove({
		conditionOpcode: 0x43,
		left: 2n,
		right: 1n
	});
	assert.equal(outcome.result.registers.registers.r14, "0x1fffffffffffffff");
});

async function runConditionalMove(options) {
	const bytes = createExecutableMachO64("conditional-move", 0);
	bytes.set(createProgram(options), CODE_OFFSET);
	const outcome = await runExecutableArtifact({
		bytes,
		extension: ".dylib",
		host: createRecordingHost()
	});
	assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
	return outcome;
}

function createProgram(options) {
	return Uint8Array.from([
		...movAbs(14, 7n),
		...movAbs(1, EXACT_SOURCE),
		...movAbs(0, options.left),
		...movAbs(2, options.right),
		0x48, 0x39, 0xd0,
		0x4c, 0x0f, options.conditionOpcode, 0xf1,
		0xc3
	]);
}

function movAbs(register, value) {
	const bytes = new Uint8Array(10);
	bytes[0] = register >= 8 ? 0x49 : 0x48;
	bytes[1] = 0xb8 + (register & 7);
	new DataView(bytes.buffer).setBigUint64(2, value, true);
	return bytes;
}
