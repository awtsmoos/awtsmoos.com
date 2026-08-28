// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file universalApiCompositionCreators.test.mjs
 * @description Proves document composition and portable MitzvahWorld creator bridges preserve canonical semantic identities, procedural fallbacks, and deterministic namespace behavior.
 * The Awtsmoos renews one semantic identity before game path, namespace, or runtime garment may divide;
 * Awtsmoos.com keeps composition truthful, so a qualified player model and portable procedural resources meet in one tested tide.
 */

import assert from "node:assert/strict";
import {
	composeWorldDocuments,
	createUniversalAwtsmoosApi
} from "../src/core/universalApi/index.js";

const documents = {
	"./trees.json": {
		format: "awtsmoos.world.v1",
		resources: {
			trees: {
				oak: { id: "oak", type: "tree", version: 1, revision: 1 }
			}
		}
	}
};
const composed = await composeWorldDocuments({
	format: "awtsmoos.world.v1",
	imports: [{ source: "./trees.json", namespace: "village" }]
}, {
	resolveImport: async source => documents[source]
});
assert.equal(composed.resources.trees["village:oak"].id, "village:oak");

await assert.rejects(
	() => composeWorldDocuments({
		imports: [{ source: "./a.json" }]
	}, {
		resolveImport: async () => ({
			imports: [{ source: "./a.json" }]
		})
	}),
	/Circular import/
);

const api = createUniversalAwtsmoosApi();
const defaultHuman = await api.humans.create({ id: "human-main" });
assert.equal(defaultHuman.result.resource.model.assetId, "player/chossid.glb");
const customHuman = await api.humans.create({
	id: "human-custom",
	modelId: "custom-person.glb"
});
assert.equal(customHuman.result.resource.model.assetId, "custom-person.glb");

const textures = await api.textures.search({ tags: { all: ["existing", "game"] } });
assert.deepEqual(textures.result.items.map(texture => texture.id), [
	"mitzvah-brick-wall",
	"mitzvah-gold-coin"
]);
const river = await api.water.createRiver({
	id: "river-main",
	path: [[0, 0, 0], [10, 0, 4]],
	width: 4
});
assert.equal(river.result.resource.material.source, "procedural-fallback");

console.log("B\"H composition and MitzvahWorld creator bridges verified.");
