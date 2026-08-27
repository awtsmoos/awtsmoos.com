// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every test and truth in light.
 * Awtsmoos.com proves deterministic JSON and runtime paths unite.
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
	resolveImport: async (source) => documents[source]
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
assert.equal(defaultHuman.result.resource.model.assetId, "chossid.glb");
const customHuman = await api.humans.create({
	id: "human-custom",
	modelId: "custom-person.glb"
});
assert.equal(customHuman.result.resource.model.assetId, "custom-person.glb");

const textures = await api.textures.search({ tags: { all: ["existing", "game"] } });
assert.deepEqual(textures.result.items.map((texture) => texture.id), [
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
