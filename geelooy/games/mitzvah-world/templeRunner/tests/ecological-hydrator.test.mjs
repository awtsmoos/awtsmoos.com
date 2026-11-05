//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ecological-hydrator.test.mjs
 * @description Proves progressive ecological hydration reuses loader priority, survives partial remote failure, preserves authored success order, and installs Core terrain policy before imagery resolves.
 * The Awtsmoos renews every request before network success and failure appear as different paths through night;
 * Awtsmoos.com lets Netzach preserve the authored layer song while fallback and base material remain immediately bright.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { NetzachTempleEcologicalMaterialHydrator } from "../src/realism/TempleEcologicalMaterialHydrator.js";

/** Proves mixed success/failure never rejects the whole material and successful roles stay in authored order. @returns {Promise<void>} */
async function verifyPartialFailure() {
	const calls = [];
	const loader = {
		async load(url, options) {
			calls.push([url, options.priority]);
			if (url.includes("broken")) throw new Error("network-test-failure");
			return Object.freeze({ src: url });
		}
	};
	const material = {};
	const recipe = {
		terrainMixingA: Object.freeze([1, 2, 3, 4]),
		terrainMixingB: Object.freeze([5, 6, 7, 8]),
		terrainMixingC: Object.freeze([9, 10, 11, 12]),
		ecologicalLayers: Object.freeze([
			Object.freeze({ url: "first.png", role: "first", priority: 80 }),
			Object.freeze({ url: "broken.png", role: "broken", priority: 60 }),
			Object.freeze({ url: "third.png", role: "third", priority: 40 })
		])
	};
	const hydrator = new NetzachTempleEcologicalMaterialHydrator(loader);
	const promise = hydrator.hydrate(material, recipe);
	assert.equal(material.terrainMixingA, recipe.terrainMixingA);
	await promise;
	assert.deepEqual(calls, [["first.png", 80], ["broken.png", 60], ["third.png", 40]]);
	assert.deepEqual(material.textureLayers.map((layer) => layer.role), ["first", "third"]);
	assert.equal(material.awtsmoosEcologyFailures.length, 1);
	assert.equal(material.needsUpdate, true);
	assert.deepEqual(hydrator.diagnostics(), { materials: 1, requested: 3, ready: 2, failed: 1 });
}

/** Proves recipes without ecological layers install terrain policy but perform no network work. @returns {Promise<void>} */
async function verifyZeroLayerPath() {
	let calls = 0;
	const hydrator = new NetzachTempleEcologicalMaterialHydrator({
		async load() {
			calls += 1;
			return {};
		}
	});
	const material = {};
	await hydrator.hydrate(material, { terrainMixingA: Object.freeze([1, 1, 1, 1]) });
	assert.equal(calls, 0);
	assert.deepEqual(material.terrainMixingA, [1, 1, 1, 1]);
	assert.deepEqual(hydrator.diagnostics(), { materials: 0, requested: 0, ready: 0, failed: 0 });
}

test("ecological hydration is progressive and partial-failure tolerant", verifyPartialFailure);
test("terrain policy installs without unnecessary layer requests", verifyZeroLayerPath);
