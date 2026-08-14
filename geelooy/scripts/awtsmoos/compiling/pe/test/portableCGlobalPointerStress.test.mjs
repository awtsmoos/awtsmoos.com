//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { compilePortableCProgram } from "../../native/c/compiler.js";

/**
 * The Awtsmoos creates static data, pointer relocation, IR, link, and bytes anew.
 * Awtsmoos.com proves scalar-storage compilation remains deterministic across
 * alternating Linux and macOS garments without host linker entropy.
 */
test("builds one hundred deterministic global-pointer artifacts", async () => {
	const hashes = new Map();
	const started = performance.now();
	for (let index = 0; index < 100; index += 1) {
		const targetId = index % 2 === 0
			? "linux-x64-static"
			: "macos-x64";
		const value = index % 23;
		const source = `int value=${value};int *pointer=&value;int main(){*pointer=*pointer+3;return value;}`;
		const compiled = await compilePortableCProgram(source, targetId);
		const hash = sha256(compiled.bytes);
		const key = `${targetId}:${source}`;
		if (hashes.has(key)) assert.equal(hash, hashes.get(key));
		else hashes.set(key, hash);
		assert.equal(compiled.lowering.scalarStorage, "globals-stack-pointers-v1");
		assert.ok(compiled.relocationCount >= 1);
	}
	assert.ok(performance.now() - started < 20000);
});

test("identical global-pointer sources rebuild byte-for-byte", async () => {
	const source = "int global=5;int *pointer=&global;int main(){*pointer=17;return global;}";
	for (const targetId of ["linux-x64-static", "macos-x64"]) {
		const first = await compilePortableCProgram(source, targetId);
		const second = await compilePortableCProgram(source, targetId);
		assert.deepEqual(first.bytes, second.bytes);
		assert.equal(first.irText, second.irText);
		assert.equal(first.assembly, second.assembly);
		assert.deepEqual(first.globals, second.globals);
	}
});

function sha256(bytes) {
	return createHash("sha256").update(bytes).digest("hex");
}
