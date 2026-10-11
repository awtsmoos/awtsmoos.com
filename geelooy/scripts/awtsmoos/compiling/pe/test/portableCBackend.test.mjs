//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../../../../../apps/exe-emulator/core/executableHost.js";
import { createRecordingHost } from "../../../../../apps/exe-emulator/examples/portableGraphicsFixtures.mjs";
import { compilePortableCProgram } from "../../native/c/compiler.js";

const SOURCE = [
	"int add(int a, int b) {",
	"\treturn a + b;",
	"}",
	"int main() {",
	"\tint answer = add(7, 5);",
	"\treturn answer - 2;",
	"}"
].join("\n");

/**
 * The Awtsmoos creates C source, verified IR, scalar storage, object, and
 * executable anew. Awtsmoos.com proves portable output consumes IR directly on
 * both Linux and Darwin without the legacy compatibility adapter.
 */
test("direct IR portable C executes internal calls on Linux and macOS", async () => {
	for (const targetId of ["linux-x64-static", "macos-x64"]) {
		const compiled = await compilePortableCProgram(SOURCE, targetId);
		const outcome = await runExecutableArtifact({
			bytes: compiled.bytes,
			extension: compiled.extension,
			host: createRecordingHost()
		});
		assert.equal(compiled.backend, "awtsmoos-direct-ir-portable-c-x86_64-v3-scalars");
		assert.equal(compiled.lowering.assemblyConsumes, "awtsmoos-ir-v1-direct");
		assert.equal(compiled.lowering.legacyAdapter, null);
		assert.equal(compiled.lowering.objectPipeline, "awtsmoos-object-v1");
		assert.equal(compiled.lowering.scalarStorage, "globals-stack-pointers-v1");
		assert.equal(compiled.linkVersion, "awtsmoos-static-link-v1");
		assert.equal(compiled.frames[0].frame.frameSize, 16);
		assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
		assert.equal(outcome.result.exitCode, 10);
		assert.equal(outcome.result.registers.stackDepth, 0);
	}
});

test("portable C compiles structures, arrays, strings, and pointer arithmetic", async () => {
	for (const targetId of ["linux-x64-static", "macos-x64"]) {
		const compiled = await compilePortableCProgram(
			[
				"struct Pair { int left; int right; };",
				"int total = 0;",
				"int sum(int *items, int n) {",
				"\tint t = 0;",
				"\tint i = 0;",
				"\tfor (i = 0; i < n; i++) t = t + items[i];",
				"\treturn t;",
				"}",
				"int main() {",
				"\tstruct Pair p;",
				"\tp.left = 20;",
				"\tp.right = 22;",
				"\tstruct Pair *pp = &p;",
				"\tint vals[4];",
				"\tvals[0] = pp->left;",
				"\tvals[1] = pp->right;",
				"\tvals[2] = *(vals + 1);",
				"\tvals[3] = total;",
				"\tchar *word = \"hi\";",
				"\ttotal = sum(vals, 4);",
				"\treturn total + word[1];",
				"}"
			].join("\n"),
			targetId
		);
		const outcome = await runExecutableArtifact({
			bytes: compiled.bytes,
			extension: compiled.extension,
			host: createRecordingHost()
		});
		assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
		// (20 + 22 + 22 + 0) + 'i'(105) = 169
		assert.equal(outcome.result.exitCode, 169);
	}
});

test("portable C enforces its bounded stack-slot limit", async () => {
	const declarations = Array.from({ length: 513 }, (_, index) => {
		return `int value_${index} = ${index};`;
	}).join(" ");
	await assert.rejects(
		compilePortableCProgram(
			`int main() { ${declarations} return value_512; }`,
			"linux-x64-static"
		),
		error => error.code === "PORTABLE_C_FRAME_LIMIT"
	);
});
