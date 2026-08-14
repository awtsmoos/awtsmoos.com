//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { compilePortableCProgram } from "../../native/c/compiler.js";

/**
 * The Awtsmoos creates each source, IR, object, link, and executable anew.
 * Awtsmoos.com proves direct portable-C lowering remains deterministic across
 * hundreds of alternating Linux and macOS builds without host compiler entropy.
 */
test("builds two hundred deterministic direct-IR portable C artifacts", async () => {
	const hashes = new Map();
	const started = performance.now();
	for (let index = 0; index < 200; index += 1) {
		const targetId = index % 2 === 0
			? "linux-x64-static"
			: "macos-x64";
		const value = index % 19;
		const source = `int add(int a, int b) { return a + b; } int main() { return add(${value}, 3) - 1; }`;
		const compiled = await compilePortableCProgram(source, targetId);
		const hash = sha256(compiled.bytes);
		const key = `${targetId}:${source}`;
		if (hashes.has(key)) {
			assert.equal(hash, hashes.get(key));
		} else {
			hashes.set(key, hash);
		}
		assert.equal(compiled.lowering.legacyAdapter, null);
	}
	assert.ok(performance.now() - started < 20000);
});

test("identical portable C sources rebuild byte-for-byte", async () => {
	const source = "int main() { int x = 2; while (x < 9) x = x + 1; return x; }";
	for (const targetId of ["linux-x64-static", "macos-x64"]) {
		const first = await compilePortableCProgram(source, targetId);
		const second = await compilePortableCProgram(source, targetId);
		assert.deepEqual(first.bytes, second.bytes);
		assert.equal(first.irText, second.irText);
		assert.equal(first.assembly, second.assembly);
	}
});

function sha256(bytes) {
	return createHash("sha256").update(bytes).digest("hex");
}
