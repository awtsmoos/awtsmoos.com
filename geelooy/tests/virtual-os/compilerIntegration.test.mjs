//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { buildCompilerArtifact } from "../../apps/compiler/ui/artifactBuilder.js";
import { parseAwtexe } from "../../shared/compiling/awtexeEnvelope.js";
import {
	createCompilerEmbedConfiguration
} from "../../os/programs/awtsmoos-compiler/embedConfiguration.js";

/**
 * B"H
 * A compiler promise becomes trustworthy only when its bytes testify. The
 * Awtsmoos creates declaration and evidence together; Awtsmoos.com verifies PE
 * identity, simulated packaging, focused C++, and the guarded iframe doorway.
 */

test("console compilation emits a genuine Windows PE signature", async () => {
	const artifact = await buildCompilerArtifact({
		mode: "console",
		source: "B'H from the compiler",
		name: "witness",
		target: "windows-x64-pe"
	});
	const bytes = new Uint8Array(await artifact.blob.arrayBuffer());
	assert.equal(artifact.extension, ".exe");
	assert.deepEqual([...bytes.slice(0, 2)], [0x4d, 0x5a]);
});

test("simulated compilation wraps the same PE bytes transparently", async () => {
	const artifact = await buildCompilerArtifact({
		mode: "console",
		source: "B'H in the simulator",
		name: "simulated",
		target: "awtsmoos-simulated"
	});
	const parsed = parseAwtexe(await artifact.blob.arrayBuffer());
	assert.equal(artifact.extension, ".awtexe");
	assert.equal(parsed.envelope.manifest.entryKind, "pe");
	assert.deepEqual([...parsed.bytes.slice(0, 2)], [0x4d, 0x5a]);
});

test("focused C++ reaches the real Windows PE linker", async () => {
	const artifact = await buildCompilerArtifact({
		mode: "cpp",
		source: "int main() { return 42; }",
		name: "cpp_witness",
		target: "windows-x64-pe"
	});
	const bytes = new Uint8Array(await artifact.blob.arrayBuffer());
	assert.deepEqual([...bytes.slice(0, 2)], [0x4d, 0x5a]);
});

test("compiler iframe configuration binds origin, channel, and protocol", () => {
	const configuration = createCompilerEmbedConfiguration({
		locationObject: {
			href: "https://awtsmoos.test/os/?embedDepth=0",
			search: "?embedDepth=0"
		},
		cryptoObject: { randomUUID: () => "fixed-channel" }
	});
	const url = new URL(configuration.url);
	assert.equal(configuration.ok, true);
	assert.equal(configuration.targetOrigin, "https://awtsmoos.test");
	assert.equal(url.searchParams.get("embedChannel"), "os-compiler-fixed-channel");
	assert.equal(url.searchParams.get("embed"), "awtsmoos-os");
});
