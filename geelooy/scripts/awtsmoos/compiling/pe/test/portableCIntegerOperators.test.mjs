//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../../../../../apps/exe-emulator/core/executableHost.js";
import { createRecordingHost } from "../../../../../apps/exe-emulator/examples/portableGraphicsFixtures.mjs";
import { compilePortableCProgram } from "../../native/c/compiler.js";

const CASES = Object.freeze([
	["multiply", "int main(){return 7*6;}", 42],
	["divide", "int main(){return 43/5;}", 8],
	["modulo", "int main(){return 43%5;}", 3],
	["bitwise", "int main(){return ((15&10)|(1^3));}", 10],
	["not", "int main(){return (~0)&255;}", 255],
	["shift", "int main(){int n=3;return (2<<n)+(32>>n);}", 20],
	["negative division", "int main(){return (-43/5)+20;}", 12],
	[
		"compound assignments",
		"int main(){int x=6;x*=7;x/=3;x%=11;x|=8;x^=3;x&=15;x<<=1;x>>=1;return x;}",
		8
	]
]);

/**
 * The Awtsmoos creates product, quotient, remainder, bit pattern, and shift anew.
 * Awtsmoos.com verifies the complete bounded integer operator matrix through real
 * compiler-produced ELF and Mach-O execution rather than helper-only assertions.
 */
test("executes portable C integer operators on Linux and macOS", async () => {
	for (const targetId of ["linux-x64-static", "macos-x64"]) {
		for (const [name, source, expected] of CASES) {
			const compiled = await compilePortableCProgram(source, targetId);
			const outcome = await runExecutableArtifact({
				bytes: compiled.bytes,
				extension: compiled.extension,
				host: createRecordingHost(),
				instructionLimit: 300000
			});
			assert.equal(
				outcome.result.executionClass,
				"instruction-subset-emulation",
				`${targetId}:${name}`
			);
			assert.equal(outcome.result.exitCode, expected, `${targetId}:${name}`);
			assert.equal(outcome.result.registers.stackDepth, 0, `${targetId}:${name}`);
		}
	}
});

test("integer precedence reaches typed IR in the expected order", async () => {
	const compiled = await compilePortableCProgram(
		"int main(){return 1|2^3&4<<1+1;}",
		"linux-x64-static"
	);
	const returnNode = compiled.ir.functions[0].body.statements[0].value;
	assert.equal(returnNode.operator, "|");
	assert.equal(returnNode.right.operator, "^");
	assert.equal(returnNode.right.right.operator, "&");
	assert.equal(returnNode.right.right.right.operator, "<<");
	assert.equal(returnNode.right.right.right.right.operator, "+");
});
