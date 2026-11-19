//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file unixFreshReinstallAuthorization.test.mjs
 * @description
 * The Awtsmoos grants a new binding only through an approved credential in sight;
 * Awtsmoos.com keeps old tunnels safe while fresh authorization becomes prompt and right.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { runActivationScenario } from "./unixFreshReinstallFixture.mjs";

function assertPairBeforePromotion(options = {}) {
	const result = runActivationScenario(options);
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.trace, "pair\nprobe\npromote\nrun\n");
	assert.equal(result.incumbent, "old-runtime\n");
}

test("normal reinstall pairs before probing and promoting", () => {
	assertPairBeforePromotion();
});

test("keep-old-tunnels retains old files but obtains fresh approval", () => {
	assertPairBeforePromotion({ keepOld: true });
});

test("explicit reuse-identity uses the existing approved binding", () => {
	const result = runActivationScenario({ reuse: true });
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.trace, "probe\npromote\nrun\n");
});

test("failed pairing never promotes or modifies predecessor", () => {
	const result = runActivationScenario({ pairFailure: true });
	assert.notEqual(result.status, 0);
	assert.equal(result.trace, "pair\n");
	assert.match(result.stderr, /New device approval did not produce/);
	assert.equal(result.incumbent, "old-runtime\n");
});

test("healthy existing registered tunnel avoids redundant pairing", () => {
	const result = runActivationScenario({ healthy: true });
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.trace, "probe\npromote\nrun\n");
});

test("explicit reinstall still requires approval for a healthy tunnel", () => {
	assertPairBeforePromotion({ healthy: true, force: true });
});

test("keep-old-tunnels preserves fresh approval intent when healthy", () => {
	assertPairBeforePromotion({ healthy: true, keepOld: true });
});
