//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../../../../../apps/exe-emulator/core/executableHost.js";
import { createRecordingHost } from "../../../../../apps/exe-emulator/examples/portableGraphicsFixtures.mjs";
import { compilePortableCProgram } from "../../native/c/compiler.js";

const PROGRAMS = Object.freeze([
	{
		expected: 7,
		name: "cross-function mutation",
		source: "int counter=3;int add(int x){counter=counter+x;return counter;}int main(){add(4);return counter;}"
	},
	{
		expected: 8,
		name: "prefix and postfix global updates",
		source: "int counter=5;int main(){int a=counter++;int b=++counter;return a+b-4;}"
	},
	{
		expected: 9,
		name: "zero and negative initialization",
		source: "int zero;int negative=-3;int main(){zero=12;return zero+negative;}"
	}
]);

/**
 * The Awtsmoos creates static storage, initializer, mutation, and result anew.
 * Awtsmoos.com verifies real object data symbols execute through both portable
 * file formats while preserving one module-wide mutable identity.
 */
test("executes mutable integer globals on Linux and macOS", async () => {
	for (const targetId of ["linux-x64-static", "macos-x64"]) {
		for (const program of PROGRAMS) {
			const compiled = await compilePortableCProgram(program.source, targetId);
			const outcome = await runExecutableArtifact({
				bytes: compiled.bytes,
				extension: compiled.extension,
				host: createRecordingHost(),
				instructionLimit: 300000
			});
			assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
			assert.equal(outcome.result.exitCode, program.expected, program.name);
			assert.equal(outcome.result.registers.stackDepth, 0, program.name);
			assert.ok(compiled.globals.length >= 1, program.name);
		}
	}
});

test("records deterministic global metadata and assembly order", async () => {
	const compiled = await compilePortableCProgram(
		"int first=1;int second=-2;int main(){return first-second;}",
		"linux-x64-static"
	);
	assert.deepEqual(compiled.globals.map(global => global.name), ["first", "second"]);
	assert.equal(compiled.globals[0].initializer.kind, "integer");
	assert.equal(compiled.globals[1].initializer.value, -2);
	assert.ok(compiled.assembly.indexOf("first:") < compiled.assembly.indexOf("second:"));
	assert.equal(compiled.lowering.scalarStorage, "globals-stack-pointers-v1");
});
