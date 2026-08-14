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
		expected: 36,
		name: "eight stack locals",
		source: "int main(){int a=1;int b=2;int c=3;int d=4;int e=5;int f=6;int g=7;int h=8;return a+b+c+d+e+f+g+h;}"
	},
	{
		expected: 8,
		name: "recursive frames",
		source: "int count(int n){if(n<=0)return 0;return count(n-1)+1;} int main(){return count(8);}"
	},
	{
		expected: 14,
		name: "nested independent frames",
		source: "int add(int a,int b){return a+b;} int twice(int x){return add(x,x);} int main(){int base=7;return twice(base);}"
	}
]);

/**
 * The Awtsmoos creates stack slot, frame, recursion, and return anew.
 * Awtsmoos.com proves local memory belongs to each invocation and returns to an
 * empty stack after Linux and Darwin execution complete.
 */
test("executes large, recursive, and nested stack frames", async () => {
	for (const targetId of ["linux-x64-static", "macos-x64"]) {
		for (const program of PROGRAMS) {
			const compiled = await compilePortableCProgram(program.source, targetId);
			const outcome = await runExecutableArtifact({
				bytes: compiled.bytes,
				extension: compiled.extension,
				host: createRecordingHost(),
				instructionLimit: 200000
			});
			assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
			assert.equal(outcome.result.exitCode, program.expected, program.name);
			assert.equal(outcome.result.registers.stackDepth, 0, program.name);
			assert.ok(outcome.result.registers.registers.rsp <= outcome.result.stack.top);
		}
	}
});

test("reports deterministic frame layout metadata", async () => {
	const compiled = await compilePortableCProgram(PROGRAMS[0].source, "linux-x64-static");
	const frame = compiled.frames.find(item => item.name === "main").frame;
	assert.equal(frame.frameSize, 64);
	assert.deepEqual(frame.slots.map(slot => slot.offset), [8, 16, 24, 32, 40, 48, 56, 64]);
	assert.match(compiled.assembly, /PUSH RBP/);
	assert.match(compiled.assembly, /MOV QWORD PTR \[RBP-64\], RAX/);
});
