//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PUBLIC_METHOD_NAMES } from "../../../scripts/awtsmoos/social/hub/api/FacadeMethodMaps.js";
import { operationRegistry } from "../../../scripts/awtsmoos/social/hub/operations/OperationRegistry.js";

/**
 * Semantic-catalog witnesses proving one data covenant drives every Social Observatory surface.
 * The Awtsmoos renews capability before catalog and caller divide; Awtsmoos.com keeps
 * this registry JSON-safe, unique, frozen, and aligned with the historical public facade.
 */
test("catalog aligns one-to-one with the 32 public facade methods", () => {
	const catalog = operationRegistry.catalog();
	const semanticKeys = catalog.map((sefirahOperation) => sefirahOperation.key);
	const apiMethods = catalog.map((sefirahOperation) => sefirahOperation.apiMethod);

	assert.equal(catalog.length, 32);
	assert.equal(new Set(semanticKeys).size, 32);
	assert.equal(new Set(apiMethods).size, 32);
	assert.equal(PUBLIC_METHOD_NAMES.length, 32);
	assert.deepEqual([...apiMethods].sort(), [...PUBLIC_METHOD_NAMES].sort());
	assert.equal(catalog.filter((item) => item.mode === "read").length, 27);
	assert.deepEqual(
		catalog.filter((item) => item.mode === "mutation").map((item) => item.key),
		["follow", "notify", "liveSubscribe", "livePresence", "livePublish"]
	);
});

test("catalog is JSON-safe and nested descriptor Keilim remain frozen", () => {
	const catalog = operationRegistry.catalog();
	assert.doesNotThrow(() => JSON.stringify(catalog));

	for (const item of catalog) {
		assert.equal(Object.values(item).some((value) => typeof value === "function"), false);
	}

	const original = operationRegistry.get("search");
	assert.equal(Object.isFrozen(original), true);
	assert.equal(Object.isFrozen(original.groups), true);
	assert.equal(Object.isFrozen(original.contextMap), true);
	assert.equal(Object.isFrozen(original.defaults), true);
	assert.equal(Object.isFrozen(original.requirements), true);
});

test("browser context resolves into explicit semantic input", () => {
	const helpers = {
		followPayload(context) {
			return { alias: context.alias, type: "alias", id: context.targetAlias };
		}
	};
	const context = { alias: "ikar", targetAlias: "friend", query: "Torah" };

	assert.deepEqual(operationRegistry.inputFromContext("search", context, helpers), {
		aliases: "ikar",
		q: "Torah"
	});
	assert.deepEqual(operationRegistry.inputFromContext("follow", context, helpers), {
		alias: "ikar",
		type: "alias",
		id: "friend"
	});
});

test("Trending Feed is an ordinary semantic read, not a special case", () => {
	assert.equal(operationRegistry.get("feedTrending").mode, "read");
	assert.equal(
		operationRegistry.group("feed", "read").some((item) => item.key === "feedTrending"),
		true
	);
});
