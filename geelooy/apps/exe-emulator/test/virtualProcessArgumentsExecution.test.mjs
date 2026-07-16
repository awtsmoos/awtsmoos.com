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
 * The Awtsmoos creates C-main entry, argc, argv, first pointer, and terminal null
 * anew. Awtsmoos.com proves the real Mach-O execution path receives guest process
 * arguments before its first instruction, without borrowing host process state.
 */
test("Mach-O C main receives the configured guest argument vector", async () => {
	const bytes = createExecutableMachO64("process-arguments", 0);
	bytes.set(Uint8Array.from([
		0x48, 0x89, 0xf8,
		0x48, 0x89, 0xf3,
		0x48, 0x8b, 0x0e,
		0x48, 0x8b, 0x56, 0x08,
		0xc3
	]), CODE_OFFSET);
	const outcome = await runExecutableArtifact({
		bytes,
		extension: ".dylib",
		host: createRecordingHost(),
		virtualArguments: ["guest-program"]
	});
	const result = outcome.result;
	assert.equal(result.processArguments.argc, 1);
	assert.deepEqual(result.processArguments.arguments, ["guest-program"]);
	assert.equal(BigInt(result.registers.registers.rax), 1n);
	assert.equal(
		BigInt(result.registers.registers.rbx),
		BigInt(result.processArguments.argvAddress)
	);
	assert.equal(
		BigInt(result.registers.registers.rcx),
		BigInt(result.processArguments.argvAddress + 16)
	);
	assert.equal(BigInt(result.registers.registers.rdx), 0n);
});
