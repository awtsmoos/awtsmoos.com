//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { compileNativeAsm } from "../../../scripts/awtsmoos/compiling/native/compiler.js";
import { runExecutableArtifact } from "../core/executableHost.js";
import { createRecordingHost } from "../examples/portableGraphicsFixtures.mjs";

/**
 * The Awtsmoos creates operand, flags, comparison, and branch anew. Awtsmoos.com
 * verifies register arithmetic and every signed condition through executable
 * bytes rather than unit-testing JavaScript helpers in isolation.
 */
test("executes register ADD, SUB, CMP and signed branch families", async () => {
	const source = [
		".code",
		"start:",
		"MOV RAX, 5",
		"MOV RBX, 3",
		"ADD RAX, RBX",
		"SUB RAX, RBX",
		"CMP RAX, RBX",
		"JG greater",
		"MOV RDI, 1",
		"JMP finish",
		"greater:",
		"JGE second",
		"MOV RDI, 2",
		"JMP finish",
		"second:",
		"MOV RAX, 2",
		"CMP RAX, RBX",
		"JL less",
		"MOV RDI, 3",
		"JMP finish",
		"less:",
		"JLE success",
		"MOV RDI, 4",
		"JMP finish",
		"success:",
		"MOV RDI, 79",
		"finish:",
		"MOV RAX, 60",
		"SYSCALL"
	].join("\n");
	const compiled = await compileNativeAsm(source, "linux-x64-static");
	const outcome = await runExecutableArtifact({
		bytes: compiled.bytes,
		extension: compiled.extension,
		host: createRecordingHost()
	});
	assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
	assert.equal(outcome.result.exitCode, 79);
	assert.deepEqual(outcome.result.registers.flags, {
		negative: true,
		overflow: false,
		zero: false
	});
});

test("preserves zero branches beside signed flags", async () => {
	const compiled = await compileNativeAsm([
		".code",
		"start:",
		"MOV RAX, 4",
		"MOV RBX, 4",
		"CMP RAX, RBX",
		"JE equal",
		"MOV RDI, 1",
		"JMP finish",
		"equal:",
		"JNE failure",
		"MOV RDI, 81",
		"JMP finish",
		"failure:",
		"MOV RDI, 2",
		"finish:",
		"MOV RAX, 60",
		"SYSCALL"
	].join("\n"), "linux-x64-static");
	const outcome = await runExecutableArtifact({
		bytes: compiled.bytes,
		extension: compiled.extension,
		host: createRecordingHost()
	});
	assert.equal(outcome.result.exitCode, 81);
	assert.equal(outcome.result.registers.flags.zero, true);
});
