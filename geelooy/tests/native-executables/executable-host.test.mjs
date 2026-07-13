//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runExecutableArtifact } from "../../apps/exe-emulator/core/executableHost.js";
import {
	createAwtexeEnvelope,
	serializeAwtexe
} from "../../shared/compiling/awtexeEnvelope.js";

/**
 * The host must hear the bytes before the filename. The Awtsmoos creates inner
 * form and outer garment together; Awtsmoos.com proves mismatch rejection and
 * keeps execution, inspection, simulation, and unknown binary handling distinct.
 */

const MACOS_X64_ARTIFACT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/ai_thoughts/20260713T161824Z_native_executable_environment/verification/artifacts/macos-x64/awtsmoos-macos-x64-hello";
const EMPTY_WASM = Uint8Array.from([0x00, 0x61, 0x73, 0x6d, 1, 0, 0, 0]);

test("selects Mach-O inspection from real artifact bytes", async () => {
	const bytes = await readFile(MACOS_X64_ARTIFACT);
	const response = await runExecutableArtifact({ bytes, extension: "" });
	assert.equal(response.identity.format, "mach-o");
	assert.equal(response.identity.architecture, "x86_64");
	assert.equal(response.result.mode, "loader-inspection");
	assert.equal(response.result.executionSupported, false);
});

test("selects ELF inspection from bytes without an extension", async () => {
	const bytes = elfFixture();
	const response = await runExecutableArtifact({ bytes });
	assert.equal(response.identity.format, "elf");
	assert.equal(response.result.mode, "loader-inspection");
	assert.equal(response.result.abi, "linux");
});

test("executes a valid empty WebAssembly module", async () => {
	const response = await runExecutableArtifact({ bytes: EMPTY_WASM });
	assert.equal(response.identity.format, "webassembly");
	assert.equal(response.result.mode, "webassembly-execution");
	assert.equal(response.result.exitCode, 0);
});

test("runs awtexe only as a simulated package", async () => {
	const envelope = createAwtexeEnvelope({
		name: "empty-wasm",
		entryKind: "wasm",
		bytes: EMPTY_WASM
	});
	const response = await runExecutableArtifact({
		bytes: serializeAwtexe(envelope),
		extension: ".awtexe"
	});
	assert.equal(response.identity.format, "awtexe");
	assert.equal(response.result.executionClass, "simulated-package");
	assert.equal(response.result.payloadIdentity.format, "webassembly");
});

test("rejects extension mismatch before runtime selection", async () => {
	await assert.rejects(
		runExecutableArtifact({ bytes: EMPTY_WASM, extension: ".exe" }),
		error => error.code === "ARTIFACT_IDENTITY_MISMATCH"
	);
});

test("opens unknown bytes in the binary inspector", async () => {
	const response = await runExecutableArtifact({ bytes: Uint8Array.from([1, 2, 3]) });
	assert.equal(response.identity.format, "unknown");
	assert.equal(response.result.mode, "binary-inspector");
	assert.equal(response.result.executionSupported, false);
});

function elfFixture() {
	const bytes = new Uint8Array(64);
	const view = new DataView(bytes.buffer);
	bytes.set([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 3], 0);
	view.setUint16(16, 2, true);
	view.setUint16(18, 62, true);
	view.setBigUint64(24, 0x1000n, true);
	return bytes;
}
