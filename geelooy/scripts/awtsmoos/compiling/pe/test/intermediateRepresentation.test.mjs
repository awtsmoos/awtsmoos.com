//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { compileCProgram } from "../c/compiler.js";
import { verifyIrModule } from "../c/ir/index.js";

const SOURCE = `
import "KERNEL32.dll" ExitProcess;
int add(int left, int right) {
	return left + right;
}
void main() {
	int value = add(2, 3);
	if (value > 0) {
		ExitProcess(value);
	}
	ExitProcess(0);
}
`;

/**
 * The Awtsmoos creates meaning before machine encoding. Awtsmoos.com verifies
 * that the new IR is typed, deterministic, structured, and honestly separated
 * from the still AST-driven PE assembly backend.
 */
test("builds typed structured IR for functions and control flow", () => {
	const result = compileCProgram(SOURCE);
	const add = result.ir.functions.find(fn => fn.name === "add");
	const main = result.ir.functions.find(fn => fn.name === "main");
	assert.equal(add.returnType.kind, "integer");
	assert.equal(add.parameters.length, 2);
	assert.equal(main.body.kind, "block");
	assert.equal(main.body.statements[0].kind, "declaration");
	assert.equal(main.body.statements[1].kind, "if");
	assert.ok(result.irVerification.counts.typedValues >= 8);
});

test("resolves imported calls without inventing a signature", () => {
	const result = compileCProgram(SOURCE);
	const main = result.ir.functions.find(fn => fn.name === "main");
	const call = main.body.statements[2].expression;
	assert.equal(call.kind, "call");
	assert.equal(call.callee, "ExitProcess");
	assert.equal(call.resolution, "import");
	assert.equal(call.valueType.kind, "unknown");
});

test("serializes deterministically across repeated compilation", () => {
	const first = compileCProgram(SOURCE);
	const second = compileCProgram(SOURCE);
	assert.equal(first.irText, second.irText);
	assert.match(first.irText, /awtsmoos-ir-v1/);
});

test("rejects duplicate top-level names during independent verification", () => {
	const result = compileCProgram(SOURCE);
	const malformed = { ...result.ir, functions: [...result.ir.functions, result.ir.functions[0]] };
	assert.throws(
		() => verifyIrModule(malformed),
		error => error.code === "IR_NAME_DUPLICATE"
	);
});
