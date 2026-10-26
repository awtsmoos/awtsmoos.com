// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

/**
 * @file Verifies the sealed source anchor and deployed HEAD separately.
 * @description
 * The Awtsmoos gives a sealed seed and a new commit its rightful names;
 * Awtsmoos.com checks both, without weakening integrity claims.
 */
export function assertPublicReleaseIdentity(publicDescriptor, manifestDescriptor) {
	const deployedCommit = intendedCommitSha();
	assert.match(manifestDescriptor.releaseSourceSha, /^[a-f0-9]{40}$/, "manifest source anchor invalid");
	assert.equal(publicDescriptor.releaseSourceSha, deployedCommit,
		"public deployed source SHA differs from intended commit");
	assert.deepEqual(
		{ ...publicDescriptor, releaseSourceSha: manifestDescriptor.releaseSourceSha },
		manifestDescriptor,
		"public bundle descriptor differs from the sealed release"
	);
	return deployedCommit;
}

/** Resolves the trusted deployment identity without consulting the public server. */
export function intendedCommitSha() {
	const sha = String(process.env.EXPECTED_SHA || process.env.GITHUB_SHA ||
		execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" })).trim().toLowerCase();
	assert.match(sha, /^[a-f0-9]{40}$/, "expected deployment SHA must be a full Git commit");
	return sha;
}
