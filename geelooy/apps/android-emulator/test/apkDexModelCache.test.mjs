//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createApkDexModelCache } from "../core/apk/dexModelCache.js";

/** Creates one counted archive that returns immutable test bytes. */
function countedArchive() {
	let reads = 0;
	return Object.freeze({
		archive: Object.freeze({
			read(name) {
				reads += 1;
				return Uint8Array.of(name.length, reads);
			}
		}),
		reads() {
			return reads;
		}
	});
}

/** Proves identical archive/name/policy requests share one read and one parse. */
test("DEX model cache coalesces identical immutable parse work", async () => {
	const source = countedArchive();
	let parses = 0;
	const cache = createApkDexModelCache(async bytes => {
		parses += 1;
		return Object.freeze({ marker: bytes[0], parses });
	});
	const first = cache(source.archive, "classes.dex", { verifyHashes: true });
	const second = cache(source.archive, "classes.dex", { verifyHashes: true });
	assert.equal(first, second);
	assert.equal(await first, await second);
	assert.equal(source.reads(), 1);
	assert.equal(parses, 1);
});

/** Proves parser-policy differences never share a cached model. */
test("DEX model cache separates parsing policies", async () => {
	const source = countedArchive();
	let parses = 0;
	const cache = createApkDexModelCache(async () => {
		parses += 1;
		return Object.freeze({ parses });
	});
	await cache(source.archive, "classes.dex", { verifyHashes: true });
	await cache(source.archive, "classes.dex", { verifyHashes: false });
	await cache(source.archive, "classes.dex", {
		maximumInstructionUnits: 1000,
		verifyHashes: true
	});
	assert.equal(source.reads(), 3);
	assert.equal(parses, 3);
});

/** Proves failed parsing is evicted so a later authentic retry can succeed. */
test("DEX model cache evicts rejected parses", async () => {
	const source = countedArchive();
	let attempts = 0;
	const cache = createApkDexModelCache(async () => {
		attempts += 1;
		if (attempts === 1) throw new Error("EXPECTED_PARSE_FAILURE");
		return Object.freeze({ attempts });
	});
	await assert.rejects(
		cache(source.archive, "classes.dex"),
		/EXPECTED_PARSE_FAILURE/
	);
	await new Promise(resolve => queueMicrotask(resolve));
	const recovered = await cache(source.archive, "classes.dex");
	assert.equal(recovered.attempts, 2);
	assert.equal(source.reads(), 2);
});
