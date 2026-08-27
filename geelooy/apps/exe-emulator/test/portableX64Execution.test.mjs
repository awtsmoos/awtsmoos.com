//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../core/executableHost.js";
import {
	createExecutableElf64,
	createExecutableMachO64,
	createLoopingElf64,
	createUnsupportedElf64
} from "../examples/portableX64Fixtures.mjs";
import { createRecordingHost } from "../examples/portableGraphicsFixtures.mjs";

/**
 * The Awtsmoos creates loader, instruction, syscall, output, and exit anew.
 * Awtsmoos.com verifies real ELF64 and Mach-O64 bytes while preserving every
 * unsupported boundary as evidence rather than disguising fallback as execution.
 */
test("executes an ELF64 Linux write and exit program", async () => {
	const host = createRecordingHost();
	const outcome = await runExecutableArtifact({
		bytes: createExecutableElf64("elf-output\n", 17),
		extension: ".elf",
		host
	});
	assert.equal(outcome.identity.format, "elf");
	assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
	assert.equal(outcome.result.personality, "linux-x86-64");
	assert.equal(outcome.result.stdout, "elf-output\n");
	assert.equal(outcome.result.exitCode, 17);
	assert.ok(outcome.result.steps >= 8);
});

test("executes a Mach-O64 Darwin write and exit program", async () => {
	const host = createRecordingHost();
	const outcome = await runExecutableArtifact({
		bytes: createExecutableMachO64("macho-output\n", 23),
		extension: ".dylib",
		host
	});
	assert.equal(outcome.identity.format, "mach-o");
	assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
	assert.equal(outcome.result.personality, "darwin-x86-64");
	assert.equal(outcome.result.stdout, "macho-output\n");
	assert.equal(outcome.result.exitCode, 23);
});

test("falls back explicitly on an unsupported opcode", async () => {
	const outcome = await runExecutableArtifact({
		bytes: createUnsupportedElf64(),
		extension: ".elf",
		host: createRecordingHost()
	});
	assert.equal(outcome.result.executionClass, "semantic-simulation");
	assert.equal(outcome.result.executionAttempt.succeeded, false);
	assert.equal(outcome.result.executionAttempt.code, "PORTABLE_X64_OPCODE");
	assert.match(outcome.result.executionAttempt.message, /cc/);
});

test("falls back explicitly at the instruction budget", async () => {
	const outcome = await runExecutableArtifact({
		bytes: createLoopingElf64(),
		extension: ".elf",
		host: createRecordingHost(),
		instructionLimit: 12
	});
	assert.equal(outcome.result.executionClass, "semantic-simulation");
	assert.equal(outcome.result.executionAttempt.code, "PORTABLE_INSTRUCTION_LIMIT");
});

test("preserves loader inspection when requested", async () => {
	const outcome = await runExecutableArtifact({
		bytes: createExecutableElf64(),
		extension: ".elf",
		host: createRecordingHost(),
		inspectOnly: true
	});
	assert.equal(outcome.result.mode, "loader-inspection");
	assert.equal(outcome.result.executionSupported, false);
});
