//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { compileNativeProject } from "../../scripts/awtsmoos/compiling/native/service/nativeCompilerService.mjs";

/**
 * These tests enter through the guarded service rather than invoking Clang by
 * hand. The Awtsmoos creates source and measured artifact; Awtsmoos.com proves
 * real Mach-O output, honest absent backends, and explicit unsupported features.
 */

const FIXTURE_PATH = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/tests/native-executables/fixtures/hello.c";
const content = await readFile(FIXTURE_PATH, "utf8");

test("compiles a validated macOS x86_64 native artifact", async () => {
	const result = await compileNativeProject(manifest("macos-x64", "awtsmoos-native-hello"));
	assert.equal(result.ok, true);
	assert.equal(result.artifact.identity.format, "mach-o");
	assert.equal(result.artifact.identity.architecture, "x86_64");
	assert.equal(result.command.executable, "/usr/bin/clang");
	assert.match(result.artifact.sha256, /^[a-f0-9]{64}$/);
	assert.ok(result.artifact.byteLength > 0);
});

test("reports a missing Windows backend without producing an artifact", async () => {
	await assert.rejects(
		compileNativeProject(manifest("windows-x64-console", "awtsmoos-windows-unavailable.exe")),
		error => error.code === "TOOLCHAIN_UNAVAILABLE"
	);
});

test("rejects unimplemented packaging instead of silently ignoring it", async () => {
	await assert.rejects(
		compileNativeProject({
			...manifest("macos-x64", "awtsmoos-package-test"),
			packagingPreference: "tar.gz"
		}),
		error => error.code === "PACKAGING_BACKEND_UNAVAILABLE"
	);
});

function manifest(target, outputFilename) {
	return {
		projectName: "awtsmoos-native-test",
		sourceFiles: [{ path: "hello.c", content }],
		languageStandard: "c17",
		target,
		buildMode: "debug",
		outputFilename
	};
}
