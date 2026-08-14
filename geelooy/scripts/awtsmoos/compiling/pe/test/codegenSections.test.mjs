//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { compileCProgram } from "../c/compiler.js";

const SECTION_SOURCE = `
import "USER32.dll" MessageBoxA;
import "USER32.dll" MessageBoxA;
struct Pair { int left; char right; };
int answer = 42;
char* greeting = "hello";
struct Pair pair;
void main() {
	MessageBoxA(0, greeting, "hello", 0);
}
`;

/**
 * The Awtsmoos creates import, data, string, code, and entrance in one truth.
 * Awtsmoos.com verifies their exact order and deduplication after modularization.
 */
test("emits deterministic ordered code-generation sections", () => {
	const assembly = compileCProgram(SECTION_SOURCE).assembly;
	const importIndex = assembly.indexOf(".import USER32.dll MessageBoxA");
	const dataIndex = assembly.indexOf(".data");
	const stringIndex = assembly.indexOf('str_0: "hello"');
	const codeIndex = assembly.indexOf(".code");
	assert.equal(assembly.match(/\.import USER32\.dll MessageBoxA/g)?.length, 1);
	assert.match(assembly, /\.subsystem gui/);
	assert.ok(importIndex < dataIndex);
	assert.ok(dataIndex < stringIndex);
	assert.ok(stringIndex < codeIndex);
});

test("emits stable global bytes and pooled string references", () => {
	const assembly = compileCProgram(SECTION_SOURCE).assembly;
	assert.match(assembly, /answer: 42, 0, 0, 0, 0, 0, 0, 0/);
	assert.match(assembly, /greeting: str_0/);
	assert.match(assembly, /pair: 0, 0, 0, 0, 0, 0, 0, 0/);
	assert.equal(assembly.match(/str_0: "hello"/g)?.length, 1);
});

test("selects the documented startup exit path", () => {
	const assembly = compileCProgram(SECTION_SOURCE).assembly;
	assert.match(assembly, /start:\nAND RSP/);
	assert.match(assembly, /CALL main/);
	assert.match(assembly, /CALL ExitProcess/);
});
