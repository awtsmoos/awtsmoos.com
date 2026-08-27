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
const batch = await api.batch([
	{
		id: "create-house",
		method: "houses.create",
		params: { id: "house-main", floors: 2 }
	},
	{
		id: "create-action",
		method: "actions.register",
		params: {
			id: "inspect-house",
			targetId: "$operations.create-house.result.resourceId",
			steps: [{ type: "lookAt", targetId: "house-main" }]
		}
	}
], { id: "village-batch" });

assert.equal(batch.ok, true);
assert.equal(batch.revisionAfter, 1);
assert.equal(api.document.resources.actions["inspect-house"].targetId, "house-main");

const beforeFailure = api.serialize();
const failed = await api.batch([
	{
		id: "valid-tree",
		method: "trees.create",
		params: { id: "tree-main" }
	},
	{
		id: "duplicate-tree",
		method: "trees.create",
		params: { id: "tree-main" }
	}
], { id: "failed-batch" });

assert.equal(failed.ok, false);
assert.equal(failed.error.code, "BATCH_FAILED");
assert.equal(api.serialize(), beforeFailure);

await api.houses.create({ id: "house-a", floors: 1 });
await api.houses.create({ id: "house-b", floors: 3 });
const query = await api.api.query({
	resource: "houses",
	where: { floors: { gte: 2 } },
	select: ["id", "floors"],
	orderBy: [{ field: "id", direction: "ascending" }]
});
assert.deepEqual(query.result.items, [
	{ id: "house-b", floors: 3 },
	{ id: "house-main", floors: 2 }
]);

console.log("B\"H universal atomic batch and query verified.");
