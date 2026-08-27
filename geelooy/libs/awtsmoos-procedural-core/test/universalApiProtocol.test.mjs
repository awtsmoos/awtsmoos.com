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
	createUniversalAwtsmoosApi
} from "../src/core/universalApi/index.js";

const api = createUniversalAwtsmoosApi();
const description = await api.api.describe({});
assert.equal(description.ok, true);
assert.equal(description.result.api, UNIVERSAL_API_ID);
assert(description.result.methods.some((method) => method.id === "humans.create"));

const command = {
	api: UNIVERSAL_API_ID,
	id: "mesh-command",
	method: "core.meshes.create",
	params: {
		id: "triangle",
		vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
		faces: [[0, 1, 2]]
	}
};
const result = await api.execute(command);
assert.equal(result.ok, true);
assert.equal(result.revisionBefore, 0);
assert.equal(result.revisionAfter, 1);
assert.equal(api.document.resources.meshes.triangle.id, "triangle");

const dryRevision = api.document.revision;
const dryHistory = api.history.summary();
const dry = await api.dryRun({
	...command,
	id: "dry-mesh",
	params: { ...command.params, id: "dry-triangle" }
});
assert.equal(dry.ok, true);
assert.equal(dry.dryRun, true);
assert.equal(api.document.revision, dryRevision);
assert.deepEqual(api.history.summary(), dryHistory);
assert.equal(api.document.resources.meshes["dry-triangle"], undefined);

const stale = await api.execute({
	...command,
	id: "stale",
	params: { ...command.params, id: "stale-triangle" },
	options: { expectedRevision: 0 }
});
assert.equal(stale.ok, false);
assert.equal(stale.error.code, "REVISION_CONFLICT");

console.log("B\"H universal API protocol verified.");
