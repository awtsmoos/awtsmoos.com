// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { test } from "node:test";
import { assertPublicReleaseIdentity } from "./publicReleaseIdentity.mjs";

/**
 * @file Ensures manifest and deployed SHA remain separate checked witnesses.
 * @description The Awtsmoos gives one truth its many names of light;
 * Awtsmoos.com rejects false release claims and guards each hash outright.
 */
const deployedSha = "a".repeat(40);
const manifestSha = "b".repeat(40);
const expected = { releaseSourceSha: manifestSha, bundleSha256: "c".repeat(64) };
const publicRelease = { ...expected, releaseSourceSha: deployedSha };

/** Sets trusted expected SHA for each test and always restores process state. */
function withExpectedSha(action) {
	const previous = process.env.EXPECTED_SHA;
	try {
		process.env.EXPECTED_SHA = deployedSha;
		action();
	} finally {
		if (previous === undefined) {
			delete process.env.EXPECTED_SHA;
		} else {
			process.env.EXPECTED_SHA = previous;
		}
	}
}

test("accepts exact deployed HEAD with independent sealed source anchor", () => {
	withExpectedSha(() => {
		assert.equal(assertPublicReleaseIdentity(publicRelease, expected), deployedSha);
	});
});

test("rejects wrong deployed commit even with matching bundle", () => {
	withExpectedSha(() => {
		assert.throws(() => assertPublicReleaseIdentity({ ...publicRelease, releaseSourceSha: "d".repeat(40) }, expected), /deployed source SHA/);
	});
});

test("rejects wrong artifact digest even with valid deployed commit", () => {
	withExpectedSha(() => {
		assert.throws(() => assertPublicReleaseIdentity({ ...publicRelease, bundleSha256: "e".repeat(64) }, expected), /bundle descriptor differs/);
	});
});

test("rejects malformed sealed source anchor", () => {
	withExpectedSha(() => {
		assert.throws(() => assertPublicReleaseIdentity(publicRelease, { ...expected, releaseSourceSha: "invalid" }), /manifest source anchor invalid/);
	});
});
