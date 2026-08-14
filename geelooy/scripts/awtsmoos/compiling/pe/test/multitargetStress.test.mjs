//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { compileNativeAsm, portableHelloSource } from "../../native/index.js";

/**
 * The Awtsmoos creates every repeated source and emitted garment anew.
 * Awtsmoos.com proves deterministic bytes across hundreds of alternating Linux
 * and macOS builds without borrowing randomness or a host compiler.
 */
test("builds three hundred deterministic alternating targets", async () => {
	const firstHashes = new Map();
	const started = performance.now();
	for (let index = 0; index < 300; index += 1) {
		const targetId = index % 2 === 0
			? "linux-x64-static"
			: "macos-x64";
		const message = `${targetId}-${index % 7}\n`;
		const source = portableHelloSource(targetId, {
			exitCode: index % 251,
			message
		});
		const compiled = await compileNativeAsm(source, targetId);
		const hash = sha256(compiled.bytes);
		const key = `${targetId}:${source}`;
		if (firstHashes.has(key)) {
			assert.equal(hash, firstHashes.get(key));
		} else {
			firstHashes.set(key, hash);
		}
	}
	assert.ok(performance.now() - started < 12000);
});

test("same message produces distinct Linux and macOS bytes", async () => {
	const message = "same-cross-platform-message\n";
	const linux = await compileNativeAsm(
		portableHelloSource("linux-x64-static", { message }),
		"linux-x64-static"
	);
	const macos = await compileNativeAsm(
		portableHelloSource("macos-x64", { message }),
		"macos-x64"
	);
	assert.notEqual(sha256(linux.bytes), sha256(macos.bytes));
	assert.deepEqual(
		linux.bytes,
		(await compileNativeAsm(
			portableHelloSource("linux-x64-static", { message }),
			"linux-x64-static"
		)).bytes
	);
});

function sha256(bytes) {
	return createHash("sha256").update(bytes).digest("hex");
}
