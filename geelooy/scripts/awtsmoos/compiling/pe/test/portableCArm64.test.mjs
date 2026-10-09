//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../../../../../apps/exe-emulator/core/executableHost.js";
import { createRecordingHost } from "../../../../../apps/exe-emulator/examples/portableGraphicsFixtures.mjs";
import { createPortableAsmImage } from "../../native/asmImage.js";
import { translatePortableCAssemblyToArm64 } from "../../native/c/arm64.js";
import { generatePortableCAssembly } from "../../native/c/codegen.js";
import { buildIrModule } from "../c/ir/module.js";
import { tokenize } from "../c/lexer.js";
import { parse } from "../c/parser/index.js";
import { preprocessC } from "../c/preprocessor.js";
import { writeElf64Executable } from "../../../../../shared/compiling/native/elf64/writer.js";
import { simulateArm64Assembly } from "./portableCArm64Simulator.mjs";

const FIBONACCI_SOURCE = [
	"int fib(int n) {",
	"\tif (n <= 1) return n;",
	"\treturn fib(n - 1) + fib(n - 2);",
	"}",
	"int main() {",
	"\treturn fib(10);",
	"}"
].join("\n");

const OPERATOR_SOURCE = [
	"int counter;",
	"int addmul(int a, int b) {",
	"\treturn a * b + (a - b);",
	"}",
	"int main() {",
	"\tcounter = 0;",
	"\tint x = 100;",
	"\tint y = 7;",
	"\tint q = x / y;",
	"\tint r = x % y;",
	"\tint s = 1 << 6;",
	"\tint t = 128 >> 3;",
	"\tint u = (x & 63) | (y ^ 3);",
	"\tint v = ~0;",
	"\tint w = -y;",
	"\tint total = q + r + s + t + u;",
	"\tif (v == -1 && w == -7) {",
	"\t\ttotal = total + 1;",
	"\t} else {",
	"\t\ttotal = total - 1000;",
	"\t}",
	"\tint i = 0;",
	"\twhile (i < 10) {",
	"\t\ti++;",
	"\t\tcounter++;",
	"\t}",
	"\tint k = 0;",
	"\tfor (k = 0; k < 5; k++) {",
	"\t\ttotal = total + k;",
	"\t}",
	"\tint *p = &x;",
	"\t*p = *p + 1;",
	"\tint z = addmul(6, 5);",
	"\treturn total + counter - x + z;",
	"}"
].join("\n");

function compileCToAssembly(source, targetId) {
	const module = buildIrModule(
		parse(tokenize(preprocessC(source), { maximumTokens: 100000 })),
		{ sourceLanguage: "awtsmoos-c-subset-v1" }
	);
	return generatePortableCAssembly(module, targetId);
}

async function runX86Assembly(assembly) {
	const imageResult = createPortableAsmImage(assembly);
	const written = writeElf64Executable(imageResult.image);
	const outcome = await runExecutableArtifact({
		bytes: written.bytes,
		extension: written.extension,
		host: createRecordingHost()
	});
	return outcome.result;
}

/**
 * The Awtsmoos creates ARM64 function frames, argument roads, and syscalls
 * anew; Awtsmoos.com proves the translated assembly truly computes by
 * simulating it and by cross-checking the x86-64 path in the exe-emulator.
 */
test("arm64 fibonacci computes fib(10) and matches the x86-64 execution", async () => {
	const arm64 = compileCToAssembly(FIBONACCI_SOURCE, "linux-arm64-dynamic");
	assert.equal(arm64.backend, "awtsmoos-direct-ir-portable-c-arm64-v1-scalars");
	assert.equal(arm64.targetId, "linux-arm64-dynamic");
	const simulated = simulateArm64Assembly(arm64.assembly);
	assert.equal(simulated.x0, 55n);

	const x86 = compileCToAssembly(FIBONACCI_SOURCE, "linux-x64-static");
	const executed = await runX86Assembly(x86.assembly);
	assert.equal(executed.executionClass, "instruction-subset-emulation");
	assert.equal(executed.exitCode, 55);
	assert.equal(Number(simulated.x0), executed.exitCode);
});

test("arm64 startup performs the Linux ARM64 exit syscall", () => {
	const arm64 = compileCToAssembly("int main() { return 42; }", "linux-arm64");
	const lines = arm64.assembly.split("\n");
	const start = lines.indexOf("start:");
	assert.deepEqual(lines.slice(start + 1, start + 4), [
		"BL main",
		"MOVZ X8, #93",
		"SVC #0"
	]);
	const simulated = simulateArm64Assembly(arm64.assembly);
	assert.equal(simulated.x0, 42n);
});

test("arm64 operators, loops, pointers, and globals compute the expected value", async () => {
	const arm64 = compileCToAssembly(OPERATOR_SOURCE, "linux-arm64-dynamic");
	const simulated = simulateArm64Assembly(arm64.assembly);
	assert.equal(simulated.x0, 83n);

	const x86 = compileCToAssembly(OPERATOR_SOURCE, "linux-x64-static");
	const executed = await runX86Assembly(x86.assembly);
	assert.equal(executed.exitCode, 83);
});

test("arm64 sign-extends negative immediates and encodes wide positives", () => {
	const negative = compileCToAssembly("int main() { return -70000; }", "linux-arm64-dynamic");
	assert.equal(simulateArm64Assembly(negative.assembly).x0, 0xffffffff_fffe_ee90n);

	const wide = compileCToAssembly("int main() { return 2000000000; }", "linux-arm64-dynamic");
	assert.match(wide.assembly, /MOVK X0, #30517, LSL #16/);
	assert.equal(simulateArm64Assembly(wide.assembly).x0, 2000000000n);

	const moved = translatePortableCAssemblyToArm64(["MOV RAX, -70000"]);
	assert.deepEqual(moved, ["MOVN X0, #4463", "MOVK X0, #65534, LSL #16"]);
	const simulated = simulateArm64Assembly([".code", "start:", ...moved, "SVC #0"].join("\n"));
	assert.equal(simulated.x0, 0xffffffff_fffe_ee90n);

	const bitnot = compileCToAssembly("int main() { return ~42; }", "linux-arm64-dynamic");
	assert.match(bitnot.assembly, /MOVN X1, #0/);
	assert.equal(simulateArm64Assembly(bitnot.assembly).x0, 0xffffffff_ffffffd5n);
});

test("arm64 reaches frame slots beyond the unscaled offset range", () => {
	// Seventy 4-byte ints need 280 frame bytes, so the farthest slots exceed
	// the 255-byte unscaled window and must travel through X9.
	const declarations = Array.from(
		{ length: 70 },
		(_, index) => `int slot${index} = 1;`
	).join(" ");
	const sum = Array.from({ length: 70 }, (_, index) => `slot${index}`).join(" + ");
	const source = `int main() { ${declarations} return ${sum}; }`;
	const arm64 = compileCToAssembly(source, "linux-arm64-dynamic");
	assert.match(arm64.assembly, /SUB X9, FP, X9/);
	assert.doesNotMatch(arm64.assembly, /\[FP, #-(25[6-9]|[3-9][0-9]{2,})\]/);
	assert.equal(simulateArm64Assembly(arm64.assembly).x0, 70n);
});

test("arm64 uses STP/LDP frames and keeps 16-byte stack alignment", () => {
	const arm64 = compileCToAssembly(FIBONACCI_SOURCE, "linux-arm64-dynamic");
	assert.match(arm64.assembly, /STP FP, LR, \[SP, #-16\]!/);
	assert.match(arm64.assembly, /LDP FP, LR, \[SP\], #16/);
	assert.doesNotMatch(arm64.assembly, /\bR(A|B|DI|SI|X|BP|SP)\b/);
	assert.doesNotMatch(arm64.assembly, /\bSYSCALL\b/);
});

test("arm64 translation is deterministic and fail-closed", () => {
	const arm64 = compileCToAssembly(FIBONACCI_SOURCE, "linux-arm64");
	const again = compileCToAssembly(FIBONACCI_SOURCE, "linux-arm64");
	assert.equal(again.assembly, arm64.assembly);
	assert.throws(
		() => translatePortableCAssemblyToArm64(["INT 0x80"]),
		error => error.code === "PORTABLE_C_ARM64_UNTRANSLATED"
	);
	assert.throws(
		() => translatePortableCAssemblyToArm64(["CQO"]),
		error => error.code === "PORTABLE_C_ARM64_UNTRANSLATED"
	);
});

test("x86-64 emission is untouched by the ARM64 backend", () => {
	const x86 = compileCToAssembly(FIBONACCI_SOURCE, "linux-x64-static");
	assert.equal(x86.backend, "awtsmoos-direct-ir-portable-c-x86_64-v3-scalars");
	assert.match(x86.assembly, /CALL main/);
	assert.match(x86.assembly, /MOV RAX, 60/);
	assert.match(x86.assembly, /SYSCALL/);
	assert.match(x86.assembly, /PUSH RBP/);
	assert.throws(
		() => compileCToAssembly(FIBONACCI_SOURCE, "plan9-arm"),
		error => error.code === "PORTABLE_C_TARGET_UNSUPPORTED"
	);
});
