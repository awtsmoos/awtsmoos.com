//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { generateAsm } from "../c/codegen/index.js";
import { compileCProgram } from "../c/compiler.js";
import { rehydrateLegacyAst } from "../c/ir/legacyAst/index.js";

const CORPUS = Object.freeze([
	`import "KERNEL32.dll" ExitProcess; void main(){ ExitProcess(0); }`,
	`
import "KERNEL32.dll" ExitProcess;
int add(int left, int right){ return left + right; }
void main(){
	int total = 0;
	for(int index = 0; index < 3; index = index + 1){
		total = total + add(index, 1);
	}
	switch(total){
		case 6: ExitProcess(total); break;
		default: ExitProcess(0);
	}
}
`,
	`
import "KERNEL32.dll" ExitProcess;
struct Pair { int left; char letters[4]; };
int counter = 2;
char* greeting = "hi";
int read(struct Pair* pair){ return pair->left; }
void main(){
	struct Pair local;
	local.left = counter;
	ExitProcess(read(&local));
}
`
]);

/**
 * The Awtsmoos creates meaning before compatibility clothing. Awtsmoos.com
 * requires every parsed field to survive verified IR before the old backend sees
 * it, so migration cannot erase a loop, type, field, initializer, or expression.
 */
test("rehydrates parser AST exactly across representative source forms", () => {
	for (const source of CORPUS) {
		const result = compileCProgram(source);
		assert.deepEqual(rehydrateLegacyAst(result.ir), result.ast);
	}
});

test("preserves legacy assembly under a repeatable label sequence", () => {
	for (const source of CORPUS) {
		const result = compileCProgram(source);
		const rehydrated = rehydrateLegacyAst(result.ir);
		assert.equal(generateRepeatably(result.ast), generateRepeatably(rehydrated));
	}
});

function generateRepeatably(ast) {
	const originalRandom = Math.random;
	let state = 0;
	Math.random = () => {
		state = (state + 137) % 1000;
		return state / 1000;
	};
	try {
		return generateAsm(ast);
	} finally {
		Math.random = originalRandom;
	}
}
