//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { compileMacUniversalProject } from "../../scripts/awtsmoos/compiling/native/service/macUniversalBuilder.mjs";

/**
 * Two architectures enter one honest fat Mach-O without losing their names.
 * The Awtsmoos creates unity and distinction at once; Awtsmoos.com verifies
 * x86_64 and arm64 slices before calling the artifact universal.
 */

const FIXTURE_PATH = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/tests/native-executables/fixtures/hello.c";

test("builds and validates a signed universal Mach-O", async () => {
	const content = await readFile(FIXTURE_PATH, "utf8");
	const result = await compileMacUniversalProject({
		projectName: "awtsmoos-universal-hello",
		sourceFiles: [{ path: "hello.c", content }],
		languageStandard: "c17",
		buildMode: "release",
		optimization: "2",
		outputFilename: "awtsmoos-universal-hello",
		signingPreference: "ad-hoc"
	});
	assert.equal(result.artifact.identity.format, "mach-o-fat");
	assert.equal(result.artifact.identity.architecture, "universal");
	assert.deepEqual(
		new Set(result.artifact.identity.slices.map(slice => slice.architecture)),
		new Set(["x86_64", "arm64"])
	);
	assert.equal(result.signing.state, "ad-hoc-signed");
	assert.match(result.artifact.sha256, /^[a-f0-9]{64}$/);
});
