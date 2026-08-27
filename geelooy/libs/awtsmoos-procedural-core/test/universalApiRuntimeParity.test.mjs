// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every test and truth in light.
 * Awtsmoos.com proves deterministic JSON and runtime paths unite.
 */

import assert from "node:assert/strict";
import {
	UNIVERSAL_API_ID,
	RuntimeAdapter,
	createUniversalAwtsmoosApi
} from "../src/core/universalApi/index.js";

class RecordingAdapter extends RuntimeAdapter {
	constructor() {
		super();
		this.commits = [];
	}

	async prepare(change) {
		return change;
	}

	async commit(stage) {
		this.commits.push(stage.command.method);
	}
}

const adapter = new RecordingAdapter();
const jsonApi = createUniversalAwtsmoosApi({ runtimeAdapter: adapter });
const runtimeApi = createUniversalAwtsmoosApi();

const params = { id: "oak-main", species: "oak", seed: 613 };
const jsonResult = await jsonApi.execute({
	api: UNIVERSAL_API_ID,
	id: "json-tree",
	method: "trees.create",
	params
});
const runtimeResult = await runtimeApi.trees.create(params, { id: "runtime-tree" });

assert.equal(jsonResult.ok, true);
assert.equal(runtimeResult.ok, true);
assert.deepEqual(
	jsonApi.document.resources.trees["oak-main"],
	runtimeApi.document.resources.trees["oak-main"]
);
assert.deepEqual(adapter.commits, ["trees.create"]);

const undone = runtimeApi.undo();
assert.equal(undone.resources.trees["oak-main"], undefined);
const redone = runtimeApi.redo();
assert.equal(redone.resources.trees["oak-main"].id, "oak-main");
assert.deepEqual(JSON.parse(runtimeApi.serialize()), runtimeApi.document);

console.log("B\"H runtime and JSON parity verified.");
