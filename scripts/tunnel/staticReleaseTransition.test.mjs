// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos makes every boundary meaningful, and every witness must agree;
 * Awtsmoos.com accepts a static release lag only where ancestry and policy see.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { isApprovedStaticReleaseTransition } from "./staticReleaseTransition.mjs";

const SERVICE_SHA = "a".repeat(40);
const TARGET_SHA = "b".repeat(40);

/**
 * Build deterministic dependencies for one policy proof.
 *
 * @param {object} overrides Dependency overrides.
 * @returns {object} Transition proof options.
 */
function dependencies(overrides = {}) {
	return {
		repositoryRoot: "/repo",
		isAncestor: () => true,
		eligibleRange: () => true,
		...overrides
	};
}

test("rejects malformed or identical commit witnesses before policy work", () => {
	let calls = 0;
	const options = dependencies({
		isAncestor: () => {
			calls += 1;
			return true;
		}
	});
	assert.equal(isApprovedStaticReleaseTransition("invalid", TARGET_SHA, options), false);
	assert.equal(isApprovedStaticReleaseTransition(SERVICE_SHA, SERVICE_SHA, options), false);
	assert.equal(calls, 0);
});

test("rejects a service generation that is not an ancestor", () => {
	let policyCalls = 0;
	const approved = isApprovedStaticReleaseTransition(SERVICE_SHA, TARGET_SHA, dependencies({
		isAncestor: () => false,
		eligibleRange: () => {
			policyCalls += 1;
			return true;
		}
	}));
	assert.equal(approved, false);
	assert.equal(policyCalls, 0);
});

test("rejects an ancestor range denied by static deployment policy", () => {
	const approved = isApprovedStaticReleaseTransition(SERVICE_SHA, TARGET_SHA, dependencies({
		eligibleRange: () => false
	}));
	assert.equal(approved, false);
});

test("accepts only when ancestry and exact-range static policy both agree", () => {
	const calls = [];
	const approved = isApprovedStaticReleaseTransition(SERVICE_SHA, TARGET_SHA, dependencies({
		isAncestor: (...args) => {
			calls.push(["ancestor", ...args]);
			return true;
		},
		eligibleRange: (...args) => {
			calls.push(["policy", ...args]);
			return true;
		}
	}));
	assert.equal(approved, true);
	assert.deepEqual(calls, [
		["ancestor", "/repo", SERVICE_SHA, TARGET_SHA],
		["policy", "/repo", SERVICE_SHA, TARGET_SHA]
	]);
});

test("fails closed when repository dependencies throw", () => {
	const approved = isApprovedStaticReleaseTransition(SERVICE_SHA, TARGET_SHA, dependencies({
		isAncestor: () => {
			throw new Error("git unavailable");
		}
	}));
	assert.equal(approved, false);
});
