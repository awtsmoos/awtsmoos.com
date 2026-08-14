// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Social Observatory operation-safety contract.
 * @description
 * The Awtsmoos gives the eye freedom to explore while the hand acts deliberately.
 * This contract fails if any known mutation can enter a bulk read group, or if the
 * explicit mutation universe drifts away from the five POST operations proven by API source.
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
	isMutationKey,
	isReadKey,
	mutationKeys,
	policyForKey
} from "../../scripts/awtsmoos/social/hub/operationPolicy.js";
import {
	allKeys,
	groupKeys,
	groupMutationKeys,
	groupNames
} from "../../scripts/awtsmoos/social/hub/operationGroups.js";

const EXPECTED_MUTATIONS = new Set([
	"follow",
	"notify",
	"liveSubscribe",
	"livePresence",
	"livePublish"
]);

test("bulk Social exploration contains reads only", () => {
	const all = allKeys();
	assert.ok(all.length > 0, "bulk exploration should expose read operations");
	for (const key of all) {
		assert.equal(isReadKey(key), true, `${key} must be classified as read-only`);
		assert.equal(isMutationKey(key), false, `${key} must never be a mutation`);
	}
});

test("every Social panel keeps mutations outside Explore", () => {
	for (const group of groupNames()) {
		for (const key of groupKeys(group)) {
			assert.equal(isReadKey(key), true, `${group}/${key} must be read-only`);
			assert.equal(EXPECTED_MUTATIONS.has(key), false, `${group}/${key} leaked a mutation`);
		}
		for (const key of groupMutationKeys(group)) {
			assert.equal(isMutationKey(key), true, `${group}/${key} must be an explicit mutation`);
		}
	}
});

test("mutation universe exactly matches the proven POST operations", () => {
	assert.deepEqual(new Set(mutationKeys()), EXPECTED_MUTATIONS);
	const groupedMutations = new Set(
		groupNames().flatMap(function mutationsForGroup(group) {
			return groupMutationKeys(group);
		})
	);
	assert.deepEqual(groupedMutations, EXPECTED_MUTATIONS);
});

test("unknown operations are never silently bulk-safe", () => {
	const unknown = "futureUnclassifiedOperation";
	assert.equal(isReadKey(unknown), false);
	assert.equal(isMutationKey(unknown), false);
	assert.equal(policyForKey(unknown).mode, "unknown");
});
