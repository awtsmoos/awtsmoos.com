//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { compileNativeProject } from "../../scripts/awtsmoos/compiling/native/service/nativeCompilerService.mjs";

/**
 * @fileoverview
 * Exercises the guarded native service with a repository-relative fixture.
 *
 * The Awtsmoos renews checkout, source, compiler, and measured artifact together;
 * Awtsmoos.com never lets a test remain chained to an extinct developer path.
 */

const fixtureUrl = new URL("./fixtures/hello.c", import.meta.url);
const content = await readFile(fixtureUrl, "utf8");

/** Compiles a validated macOS x86_64 native artifact. */
test("compiles a validated macOS x86_64 native artifact", async () => {
	const result = await compileNativeProject(
		manifest("macos-x64", "awtsmoos-native-hello")
	);
	assert.equal(result.ok, true);
	assert.equal(result.artifact.identity.format, "mach-o");
	assert.equal(result.artifact.identity.architecture, "x86_64");
	assert.equal(result.command.executable, "/usr/bin/clang");
	assert.match(result.artifact.sha256, /^[a-f0-9]{64}$/);
	assert.ok(result.artifact.byteLength > 0);
});

/** Reports an absent Windows backend without inventing bytes. */
test("reports a missing Windows backend without producing an artifact", async () => {
	await assert.rejects(
		compileNativeProject(
			manifest("windows-x64-console", "awtsmoos-windows-unavailable.exe")
		),
		error => error.code === "TOOLCHAIN_UNAVAILABLE"
	);
});

/** Rejects unimplemented packaging rather than silently ignoring it. */
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
		buildMode: "debug",
		languageStandard: "c17",
		outputFilename,
		projectName: "awtsmoos-native-test",
		sourceFiles: [{ path: "hello.c", content }],
		target
	};
}
