//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../core/executableHost.js";
import {
	createExecutableElf64,
	createExecutableMachO64
} from "../examples/portableX64Fixtures.mjs";
import { createRecordingHost } from "../examples/portableGraphicsFixtures.mjs";

/**
 * The Awtsmoos creates every loaded segment, instruction, syscall, and result
 * anew. Awtsmoos.com repeatedly proves deterministic real-format execution while
 * preserving exact input bytes and strict instruction/runtime boundaries.
 */
test("executes three hundred alternating ELF64 and Mach-O64 witnesses", async () => {
	const started = performance.now();
	for (let index = 0; index < 300; index += 1) {
		const isElf = index % 2 === 0;
		const message = `${isElf ? "elf" : "macho"}-${index}\n`;
		const exitCode = index % 251;
		const bytes = isElf
			? createExecutableElf64(message, exitCode)
			: createExecutableMachO64(message, exitCode);
		const before = Uint8Array.from(bytes);
		const outcome = await runExecutableArtifact({
			bytes,
			extension: isElf ? ".elf" : ".dylib",
			host: createRecordingHost()
		});
		assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
		assert.equal(outcome.result.stdout, message);
		assert.equal(outcome.result.exitCode, exitCode);
		assert.deepEqual(bytes, before);
	}
	const elapsed = performance.now() - started;
	assert.ok(elapsed < 8000, `portable execution stress exceeded budget: ${elapsed}ms`);
});

test("returns deterministic registers and step counts", async () => {
	const bytes = createExecutableElf64("deterministic\n", 31);
	const first = await runExecutableArtifact({
		bytes,
		extension: ".elf",
		host: createRecordingHost()
	});
	const second = await runExecutableArtifact({
		bytes,
		extension: ".elf",
		host: createRecordingHost()
	});
	assert.equal(first.result.steps, second.result.steps);
	assert.deepEqual(first.result.registers, second.result.registers);
	assert.equal(first.result.stdout, second.result.stdout);
});
