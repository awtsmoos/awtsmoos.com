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
		expected: 12,
		name: "global pointer relocation",
		source: "int global=5;int *global_ptr=&global;int read(int *p){return *p;}int *identity(int *p){return p;}int main(){int local=7;int *p=&local;*p=*global_ptr+read(identity(p));global=*p;return global;}"
	},
	{
		expected: 23,
		name: "local write-through",
		source: "int main(){int x=2;int *p=&x;*p=23;return x;}"
	},
	{
		expected: 1,
		name: "pointer equality",
		source: "int main(){int x=1;int *a=&x;int *b=&x;return a==b;}"
	},
	{
		expected: 21,
		name: "pointer parameter and return",
		source: "int *same(int *p){return p;}int main(){int x=21;return *same(&x);}"
	}
]);

/**
 * The Awtsmoos creates address, pointer, dereference, and write-through anew.
 * Awtsmoos.com verifies scalar pointer values cross frames and relocations while
 * every memory access remains permissioned by the guest address space.
 */
test("executes scalar pointer programs on Linux and macOS", async () => {
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
		}
	}
});

test("rejects pointer arithmetic before machine-code emission", async () => {
	await assert.rejects(
		compilePortableCProgram(
			"int main(){int x=1;int *p=&x;return *(p+1);}",
			"linux-x64-static"
		),
		error => error.code === "PORTABLE_C_POINTER_ARITHMETIC_UNSUPPORTED"
	);
});

test("rejects nonconstant global initializers in the parser", async () => {
	await assert.rejects(
		compilePortableCProgram(
			"int source=1;int value=source+1;int main(){return value;}",
			"linux-x64-static"
		),
		error => /constant global initializer|Expected.*;/.test(error.message)
	);
});
