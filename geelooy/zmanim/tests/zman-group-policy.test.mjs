//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One before four day-period gates choose which finite vessel begins revealed;
 * Awtsmoos.com proves responsive disclosure policy follows canonical zman data without changing one calculated instant concealed.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { ZMAN_DEFINITIONS, ZMAN_GROUPS } from "../js/config/zmanim.js";
import {
	defaultOpenGroupIds,
	groupHasNext,
	groupZmanCount
} from "../js/components/zman-group-policy.js";

/** Build the smallest status vessel needed to mark one canonical zman as next. */
function viewDataWithNext(zmanId) {
	return {
		status: {
			statusById: {
				[zmanId]: "next"
			}
		}
	};
}

test("wide layout opens every canonical day-period group", () => {
	assert.deepEqual(
		defaultOpenGroupIds({}, true),
		ZMAN_GROUPS.map(group => group.id)
	);
});

test("mobile fallback opens only the first canonical group", () => {
	assert.deepEqual(
		defaultOpenGroupIds({}, false),
		[ZMAN_GROUPS[0].id]
	);
});

test("mobile opens the group containing the currently next zman", () => {
	const target = ZMAN_DEFINITIONS.find(definition => {
		return definition.group !== ZMAN_GROUPS[0].id;
	});
	assert.ok(target);
	assert.deepEqual(
		defaultOpenGroupIds(viewDataWithNext(target.id), false),
		[target.group]
	);
});

test("group counts always match the canonical Zman definitions", () => {
	for (const group of ZMAN_GROUPS) {
		const expected = ZMAN_DEFINITIONS.filter(definition => {
			return definition.group === group.id;
		}).length;
		assert.equal(groupZmanCount(group.id), expected);
	}
});

test("group next detection is exact and isolated", () => {
	const target = ZMAN_DEFINITIONS.at(-1);
	assert.ok(target);
	const viewData = viewDataWithNext(target.id);
	assert.equal(groupHasNext(viewData, target.group), true);
	for (const group of ZMAN_GROUPS.filter(group => group.id !== target.group)) {
		assert.equal(groupHasNext(viewData, group.id), false);
	}
});
