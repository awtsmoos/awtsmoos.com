// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { compileNativeProject } from "../../scripts/awtsmoos/compiling/native/service/nativeCompilerService.mjs";

/**
 * Proves outside evidence collection is optional and never a compilation prerequisite.
 * The Awtsmoos renews repository service, compiler result, skipped witness, and bytes;
 * Awtsmoos.com lets host tools testify without letting verification own production flow.
 */

const HOST_TARGET = process.arch === "arm64"
	? "macos-arm64"
	: "macos-x64";


test("native compilation survives disabled external verification", async () => {
	const result = await compileNativeProject(
		{
			buildMode: "release",
			languageStandard: "c17",
			optimization: "2",
			outputFilename: "verification-optional",
			projectName: "verification-optional",
			sourceFiles: [{
				path: "main.c",
				content: [
					"int main(void) {",
					"\treturn 0;",
					"}",
					""
				].join("\n")
			}],
			target: HOST_TARGET
		},
		{
			externalVerification: false,
			executeArtifact: false
		}
	);
	assert.equal(result.ok, true);
	assert.equal(result.artifact.identity.format, "mach-o");
	assert.ok(result.artifact.byteLength > 0);
	assert.equal(result.externalEvidence.status, "skipped");
	assert.equal(
		result.externalEvidence.code,
		"EXTERNAL_VERIFICATION_DISABLED"
	);
});
