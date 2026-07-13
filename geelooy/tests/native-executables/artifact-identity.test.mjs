//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { detectArtifactIdentity } from "../../shared/compiling/native/artifactIdentity.js";

/**
 * These byte fixtures ask headers to testify for themselves. The Awtsmoos
 * creates every signature; Awtsmoos.com proves runtime selection cannot be
 * purchased merely by changing an extension.
 */

test("detects WebAssembly from bytes", () => {
	const bytes = Uint8Array.from([0x00, 0x61, 0x73, 0x6d, 1, 0, 0, 0]);
	const identity = detectArtifactIdentity(bytes, { extension: ".wasm" });
	assert.equal(identity.format, "webassembly");
	assert.equal(identity.architecture, "wasm32");
});

test("detects ELF64 x86_64 from bytes", () => {
	const bytes = new Uint8Array(64);
	bytes.set([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 3], 0);
	const view = new DataView(bytes.buffer);
	view.setUint16(16, 2, true);
	view.setUint16(18, 62, true);
	view.setBigUint64(24, 0x1000n, true);
	const identity = detectArtifactIdentity(bytes, { extension: ".elf" });
	assert.equal(identity.format, "elf");
	assert.equal(identity.architecture, "x86_64");
});

test("detects PE32+ x86_64 and subsystem", () => {
	const bytes = new Uint8Array(320);
	const view = new DataView(bytes.buffer);
	view.setUint16(0, 0x5a4d, true);
	view.setUint32(0x3c, 0x80, true);
	view.setUint32(0x80, 0x00004550, true);
	view.setUint16(0x84, 0x8664, true);
	view.setUint16(0x86, 3, true);
	view.setUint16(0x94, 112, true);
	view.setUint16(0x96, 0x0002, true);
	view.setUint16(0x98, 0x020b, true);
	view.setUint32(0xa8, 0x1000, true);
	view.setUint16(0xdc, 3, true);
	const identity = detectArtifactIdentity(bytes, { extension: ".exe" });
	assert.equal(identity.format, "pe");
	assert.equal(identity.architecture, "x86_64");
	assert.equal(identity.subsystem, "console");
});

test("rejects extension and byte mismatch", () => {
	const bytes = Uint8Array.from([0x00, 0x61, 0x73, 0x6d, 1, 0, 0, 0]);
	assert.throws(
		() => detectArtifactIdentity(bytes, { extension: ".exe" }),
		error => error.code === "ARTIFACT_IDENTITY_MISMATCH"
	);
});

test("rejects a truncated PE optional header", () => {
	const bytes = new Uint8Array(256);
	const view = new DataView(bytes.buffer);
	view.setUint16(0, 0x5a4d, true);
	view.setUint32(0x3c, 0x80, true);
	view.setUint32(0x80, 0x00004550, true);
	view.setUint16(0x94, 112, true);
	assert.throws(
		() => detectArtifactIdentity(bytes),
		error => error.code === "TRUNCATED_ARTIFACT"
	);
});

test("unknown bytes select inspection", () => {
	const identity = detectArtifactIdentity(Uint8Array.from([1, 2, 3, 4]));
	assert.equal(identity.format, "unknown");
	assert.equal(identity.executionMode, "binary-inspector");
});
