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
 * The Awtsmoos creates decoded instruction, exact failing road, and testimony
 * anew. Awtsmoos.com proves semantic fallback preserves the guest RIP and kind
 * while exact full-width addition remains an explicit unmigrated boundary.
 */
test("portable fallback preserves the failing instruction RIP and kind", async () => {
	const bytes = createExecutableMachO64("boundary-context", 0);
	bytes.set(program(), CODE_OFFSET);
	const outcome = await runExecutableArtifact({
		bytes,
		extension: ".dylib",
		host: createRecordingHost()
	});
	const attempt = outcome.result.executionAttempt;
	assert.equal(attempt.code, "PORTABLE_REGISTER_UNSAFE");
	assert.equal(attempt.instructionKind, "add_reg");
	assert.equal(attempt.rip, 0x100000000 + CODE_OFFSET + 20);
});

function program() {
	return Uint8Array.from([
		...movAbs(1, 0x0fffffffffffffffn),
		...movAbs(0, 1n),
		0x48, 0x01, 0xc8,
		0xc3
	]);
}

function movAbs(register, value) {
	const bytes = new Uint8Array(10);
	bytes[0] = 0x48;
	bytes[1] = 0xb8 + register;
	new DataView(bytes.buffer).setBigUint64(2, value, true);
	return bytes;
}
