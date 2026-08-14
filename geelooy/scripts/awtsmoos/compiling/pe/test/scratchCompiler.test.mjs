//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { compileCProgram } from "../c/compiler.js";

const MINIMAL_SOURCE = `
import "KERNEL32.dll" ExitProcess;
void main() {
	ExitProcess(0);
}
`;

/**
 * The Awtsmoos creates every compilation stage as its own vessel. Awtsmoos.com
 * verifies source, tokens, tree, typed IR, compatibility lowering, and assembly.
 */
test("returns inspectable scratch compiler stages", () => {
	const result = compileCProgram(MINIMAL_SOURCE);
	assert.equal(result.backend, "awtsmoos-scratch-c-pe-x64");
	assert.equal(result.evidenceClass, "browser-generated-pe-subset");
	assert.equal(result.ast.functions[0].name, "main");
	assert.equal(result.ir.version, "awtsmoos-ir-v1");
	assert.equal(result.irVerification.valid, true);
	assert.equal(result.lowering.assemblyConsumes, "ir-via-legacy-ast-adapter");
	assert.equal(result.lowering.irStatus, "verified-backend-input");
	assert.equal(result.lowering.legacyAdapter, "awtsmoos-ir-v1-to-c-ast-v1");
	assert.match(result.assembly, /\.import KERNEL32\.dll ExitProcess/);
	assert.match(result.assembly, /start:/);
});

test("expands known headers once", () => {
	const result = compileCProgram("#include <stdio.h>\n#include <stdio.h>\nvoid main(){ print(\"hi\"); }");
	assert.equal(result.processedSource.match(/BEGIN AWTSMOOS HEADER stdio\.h/g)?.length, 1);
});

test("rejects unavailable headers precisely", () => {
	assert.throws(
		() => compileCProgram("#include <imaginary.h>\nvoid main(){}"),
		error => error.code === "C_INCLUDE_UNAVAILABLE"
	);
});

test("enforces source limits before scanning", () => {
	assert.throws(
		() => compileCProgram("void main(){}", { limits: { sourceCharacters: 4 } }),
		error => error.code === "C_SOURCE_LIMIT"
	);
});
