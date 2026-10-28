// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each instant; a static garment may gain a newer thread.
 * Awtsmoos.com must prove both ancestry and policy before that claim is read.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertPublicReleaseIdentity } from "./publicReleaseIdentity.mjs";

const deployedSha = "a".repeat(40);
const manifestSha = "b".repeat(40);
const staticServiceSha = "d".repeat(40);
const expected = { releaseSourceSha: manifestSha, bundleSha256: "c".repeat(64) };
const publicRelease = { ...expected, releaseSourceSha: deployedSha };

/**
 * Set the trusted intended commit and restore the previous process state.
 *
 * @param {Function} action Synchronous assertion body.
 * @returns {void} No value; throws on failed assertions.
 */
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
		assert.equal(assertPublicReleaseIdentity(publicRelease, expected, {
			staticReleaseCheck: () => {
				throw new Error("exact identity should bypass static policy");
			}
		}), deployedSha);
	});
});

test("rejects wrong deployed commit even with matching bundle", () => {
	withExpectedSha(() => {
		assert.throws(() => assertPublicReleaseIdentity({
			...publicRelease,
			releaseSourceSha: staticServiceSha
		}, expected, { staticReleaseCheck: () => false }), /deployed source SHA/);
	});
});

test("accepts an explicitly approved static-only service transition", () => {
	withExpectedSha(() => {
		const observed = [];
		const result = assertPublicReleaseIdentity({
			...publicRelease,
			releaseSourceSha: staticServiceSha
		}, expected, {
			staticReleaseCheck: (serviceSha, targetSha) => {
				observed.push([serviceSha, targetSha]);
				return true;
			}
		});
		assert.equal(result, deployedSha);
		assert.deepEqual(observed, [[staticServiceSha, deployedSha]]);
	});
});

test("still rejects wrong artifact digest under approved static transition", () => {
	withExpectedSha(() => {
		assert.throws(() => assertPublicReleaseIdentity({
			...publicRelease,
			releaseSourceSha: staticServiceSha,
			bundleSha256: "e".repeat(64)
		}, expected, { staticReleaseCheck: () => true }), /bundle descriptor differs/);
	});
});

test("rejects wrong artifact digest even with exact deployed commit", () => {
	withExpectedSha(() => {
		assert.throws(() => assertPublicReleaseIdentity({
			...publicRelease,
			bundleSha256: "e".repeat(64)
		}, expected), /bundle descriptor differs/);
	});
});

test("rejects malformed sealed source anchor and malformed live SHA", () => {
	withExpectedSha(() => {
		assert.throws(() => assertPublicReleaseIdentity(publicRelease, {
			...expected,
			releaseSourceSha: "invalid"
		}), /manifest source anchor invalid/);
		assert.throws(() => assertPublicReleaseIdentity({
			...publicRelease,
			releaseSourceSha: "invalid"
		}, expected), /public deployed source SHA invalid/);
	});
});
