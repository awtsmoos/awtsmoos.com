//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../../../../../apps/exe-emulator/core/executableHost.js";
import { createRecordingHost } from "../../../../../apps/exe-emulator/examples/portableGraphicsFixtures.mjs";
import { detectArtifactIdentity } from "../../../../../shared/compiling/native/artifactIdentity.js";
import {
	compileNativeAsm,
	portableHelloSource
} from "../../native/index.js";

/**
 * The Awtsmoos creates source, executable garment, and observable result anew.
 * Awtsmoos.com proves that scratch-written ELF and Mach-O bytes execute through
 * their respective syscall personalities rather than stopping at file identity.
 */
test("compiles and executes Linux and macOS assembly targets", async () => {
	for (const specification of targetSpecifications()) {
		const source = portableHelloSource(specification.targetId, {
			exitCode: specification.exitCode,
			message: specification.message
		});
		const compiled = await compileNativeAsm(source, specification.targetId);
		const identity = detectArtifactIdentity(compiled.bytes, {
			extension: compiled.extension
		});
		const outcome = await runExecutableArtifact({
			bytes: compiled.bytes,
			extension: compiled.extension,
			host: createRecordingHost()
		});
		assert.equal(identity.format, specification.format);
		assert.equal(identity.architecture, "x86_64");
		assert.equal(compiled.targetId, specification.targetId);
		assert.match(compiled.writer, /awtsmoos-scratch/);
		assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
		assert.equal(outcome.result.personality, specification.personality);
		assert.equal(outcome.result.stdout, specification.message);
		assert.equal(outcome.result.exitCode, specification.exitCode);
		assert.equal(outcome.result.completeCpuEmulation, false);
	}
});

test("portable assembly rejects imports and unsupported targets", async () => {
	await assert.rejects(
		compileNativeAsm([
			'.import KERNEL32.dll ExitProcess',
			'.code',
			'start:',
			'CALL ExitProcess'
		].join("\n"), "linux-x64-static"),
		/PORTABLE_ASM_IMPORTS_UNSUPPORTED/
	);
	await assert.rejects(
		compileNativeAsm(".code\nstart:\nRET", "linux-x64-dynamic"),
		/native_asm_target_unsupported/
	);
});

test("existing Windows route still emits PE bytes", async () => {
	const result = await compileNativeAsm([
		'.subsystem console',
		'.import KERNEL32.dll ExitProcess',
		'.code',
		'start:',
		'MOV RCX, 0',
		'CALL ExitProcess'
	].join("\n"), "windows-x64-console");
	const identity = detectArtifactIdentity(result.bytes, { extension: ".exe" });
	assert.equal(identity.format, "pe");
	assert.equal(result.writer, "awtsmoos-scratch-pe64-v1");
});

function targetSpecifications() {
	return [
		{
			exitCode: 27,
			format: "elf",
			message: "compiled-linux\n",
			personality: "linux-x86-64",
			targetId: "linux-x64-static"
		},
		{
			exitCode: 29,
			format: "mach-o",
			message: "compiled-macos\n",
			personality: "darwin-x86-64",
			targetId: "macos-x64"
		}
	];
}
