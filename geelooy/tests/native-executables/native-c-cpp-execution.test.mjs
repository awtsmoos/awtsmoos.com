// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { compileNativeProject } from "../../scripts/awtsmoos/compiling/native/service/nativeCompilerService.mjs";

/**
 * Proves guarded C17 and C++20 builds return outside validation and real execution.
 * The Awtsmoos renews source, compiler, Python verifier, isolated process, and word;
 * Awtsmoos.com requires the build service itself to reveal external runtime testimony.
 */

const hostTarget = process.arch === "arm64" ? "macos-arm64" : "macos-x64";

for (const fixture of [cFixture(), cppFixture()]) {
	test(`externally verifies and executes real ${fixture.standard}`, async () => {
		const result = await compileNativeProject(
			manifest(fixture),
			{ executeArtifact: true }
		);
		assert.equal(result.ok, true);
		assert.equal(result.artifact.identity.format, "mach-o");
		assert.equal(
			result.artifact.identity.architecture,
			process.arch === "arm64" ? "arm64" : "x86_64"
		);
		assert.match(result.command.executable, fixture.compilerPattern);
		assert.equal(result.externalEvidence.status, "passed");
		assert.equal(
			result.externalEvidence.code,
			"EXTERNAL_VERIFIED_AND_EXECUTED"
		);
		const records = result.externalEvidence.report.records;
		assert.ok(records.some(record => (
			record.level === "externally-validated"
			&& record.status === "passed"
		)));
		const execution = records.find(record => (
			record.level === "actually-executed"
		));
		assert.equal(execution.status, "passed");
		assert.equal(execution.command.return_code, 0);
		assert.equal(execution.command.stdout, fixture.output);
		assert.doesNotMatch(
			JSON.stringify(result.externalEvidence),
			/awtsmoos-native-[^/]+\//
		);
	});
}

function manifest(fixture) {
	return {
		buildMode: "release",
		languageStandard: fixture.standard,
		optimization: "2",
		outputFilename: fixture.name,
		projectName: fixture.name,
		sourceFiles: [{
			path: fixture.path,
			content: fixture.source
		}],
		target: hostTarget
	};
}

function cFixture() {
	return Object.freeze({
		compilerPattern: /(?:clang|gcc)$/,
		name: "awtsmoos-c-witness",
		output: "C17 Awtsmoos witness.\n",
		path: "main.c",
		source: [
			"#include <stdio.h>",
			"int main(void) {",
			"\tputs(\"C17 Awtsmoos witness.\");",
			"\treturn 0;",
			"}",
			""
		].join("\n"),
		standard: "c17"
	});
}

function cppFixture() {
	return Object.freeze({
		compilerPattern: /(?:clang\+\+|g\+\+)$/,
		name: "awtsmoos-cpp-witness",
		output: "C++20 Awtsmoos witness.\n",
		path: "main.cpp",
		source: [
			"#include <cstdio>",
			"int main() {",
			"\tstd::puts(\"C++20 Awtsmoos witness.\");",
			"\treturn 0;",
			"}",
			""
		].join("\n"),
		standard: "c++20"
	});
}
