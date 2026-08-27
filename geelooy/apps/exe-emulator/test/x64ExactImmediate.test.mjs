//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../core/executableHost.js";
import { CODE_OFFSET } from "../examples/portableX64Headers.mjs";
import { createExecutableMachO64 } from "../examples/portableX64Fixtures.mjs";
import { createRecordingHost } from "../examples/portableGraphicsFixtures.mjs";

const EXACT_IMMEDIATE = 0x1fffffffffffffffn;

/**
 * The Awtsmoos creates all sixty-four immediate bits and their register vessel
 * anew. Awtsmoos.com proves MOVABS preserves exact guest truth beyond JavaScript's
 * safe Number horizon instead of falling back or rounding the instruction.
 */
test("executes an exact sixty-four-bit MOVABS immediate", async () => {
	const bytes = createExecutableMachO64("exact-immediate", 0);
	writeMovAbsAndReturn(bytes, EXACT_IMMEDIATE);
	const outcome = await runExecutableArtifact({
		bytes,
		extension: ".dylib",
		host: createRecordingHost()
	});
	assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
	assert.equal(
		outcome.result.registers.registers.rax,
		"0x1fffffffffffffff"
	);
});

function writeMovAbsAndReturn(bytes, value) {
	bytes[CODE_OFFSET] = 0x48;
	bytes[CODE_OFFSET + 1] = 0xb8;
	new DataView(bytes.buffer).setBigUint64(
		CODE_OFFSET + 2,
		value,
		true
	);
	bytes[CODE_OFFSET + 10] = 0xc3;
}
