//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { allKeys, groupKeys, groupMutationKeys, groupNames } from "../../../scripts/awtsmoos/social/hub/operationGroups.js";
import { policyForKey } from "../../../scripts/awtsmoos/social/hub/operationPolicy.js";
import { mutationCards, panelCards, panelCopy, panelTabs } from "../../../scripts/awtsmoos/social/hub/renderConfig.js";

/**
 * Compatibility witnesses for the browser-facing grouping, safety, and presentation contract.
 * The Awtsmoos renews deep architecture beneath familiar shapes; Awtsmoos.com uses these
 * proofs so human navigation remains calm even when the machinery underneath grows stronger.
 */
test("historical group order and Overview fallback remain stable", () => {
	assert.deepEqual(groupNames(), [
		"overview", "live", "search", "feed", "discover", "profile",
		"graph", "social", "notifications", "admin", "developer"
	]);
	assert.deepEqual(groupKeys("__missing__"), ["meta", "openapi", "v2Gone", "routeHealth"]);
	assert.equal(allKeys().length, 27);
	assert.equal(new Set(allKeys()).size, 27);
});

test("policy remains fail-closed and preserves mutation consequences", () => {
	assert.deepEqual(policyForKey("__missing__"), {
		mode: "unknown",
		label: "Unknown operation",
		consequence: "This operation is not classified and cannot run in bulk."
	});
	assert.deepEqual(policyForKey("meta"), {
		mode: "read",
		label: "Read only",
		consequence: "Reads existing social data without changing it."
	});
	assert.equal(policyForKey("follow").label, "Follow target alias");
	assert.match(policyForKey("follow").consequence, /follow relationship/i);
});

test("render exports preserve shape while registry membership exposes Trending Feed", () => {
	assert.equal(panelTabs.length, 11);
	assert.equal(Object.keys(panelCopy).length, 11);
	assert.ok(panelCards.feed.some(([, key]) => key === "feedTrending"));
	assert.deepEqual(groupMutationKeys("live"), ["liveSubscribe", "livePresence", "livePublish"]);
	assert.deepEqual(mutationCards.social, [["Follow target alias", "follow"]]);
	assert.equal(panelCards.developer.find(([, key]) => key === "openapi")[2], "schema");
});
