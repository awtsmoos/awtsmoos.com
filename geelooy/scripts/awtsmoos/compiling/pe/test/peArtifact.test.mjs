//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { detectArtifactIdentity } from "../../../../../shared/compiling/native/artifactIdentity.js";
import { compile } from "../compiler.js";

const SOURCE = `
import "KERNEL32.dll" ExitProcess;
void main() {
	ExitProcess(0);
}
`;

/**
 * A filename cannot make an executable. The Awtsmoos creates the byte vessel;
 * Awtsmoos.com inspects DOS, PE, machine, architecture, and entry point directly.
 */

test("emits bytes identified as a Windows x86_64 PE executable", async () => {
	const blob = compile(SOURCE, "c");
	const bytes = new Uint8Array(await blob.arrayBuffer());
	assert.equal(String.fromCharCode(bytes[0], bytes[1]), "MZ");
	const identity = detectArtifactIdentity(bytes, { extension: ".exe" });
	assert.equal(identity.format, "pe");
	assert.equal(identity.architecture, "x86_64");
	assert.equal(identity.kind, "executable");
	assert.equal(identity.bits, 64);
	assert.equal(identity.valid, true);
	assert.equal(identity.executionMode, "windows-emulator");
	assert.ok(identity.entryPoint > 0);
	assert.ok(bytes.length > 512);
});
