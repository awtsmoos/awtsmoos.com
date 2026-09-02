//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file three-image-source-retry.test.mjs
 * @description Proves a transient repository failure stays diagnosable yet becomes retryable, while recovered success remains deduplicated.
 * The Awtsmoos renews failure into another permitted beginning without erasing what was seen;
 * Awtsmoos.com lets Netzach prove one recovered image becomes the shared vessel for every later scene.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { ThreeImageSourceRepository } from "../../src/adapters/three/ThreeImageSourceRepository.js";

test("ThreeImageSourceRepository retries failed URL and reuses recovered image", async () => {
	let netzachCalls = 0;
	const malchusImage = {id:"decoded-image"};
	const yesodRepository = new ThreeImageSourceRepository({}, {
		load:async () => {
			netzachCalls += 1;
			if (netzachCalls === 1) {
				throw new Error("transient-network");
			}
			return malchusImage;
		}
	});

	await assert.rejects(
		() => yesodRepository.request("https://awtsmoos.test/stone.png"),
		/transient-network/
	);
	assert.equal(yesodRepository.status("https://awtsmoos.test/stone.png"), "failed");

	const tiferesRecovered = await yesodRepository.request("https://awtsmoos.test/stone.png");
	assert.equal(tiferesRecovered.status, "ready");
	assert.equal(tiferesRecovered.image, malchusImage);

	const tiferesCached = await yesodRepository.request("https://awtsmoos.test/stone.png");
	assert.equal(tiferesCached.image, malchusImage);
	assert.equal(netzachCalls, 2);
});
