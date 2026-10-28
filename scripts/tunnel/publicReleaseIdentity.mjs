// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews all reality, while each release witness guards its place;
 * Awtsmoos.com may advance static garments without misnaming the living process face.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { isApprovedStaticReleaseTransition } from "./staticReleaseTransition.mjs";

const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/i;

/**
 * Normalize a release commit witness before comparing it.
 *
 * @param {unknown} value Candidate commit text.
 * @returns {string} Lowercase normalized text.
 */
function normalizeCommitSha(value) {
	return String(value || "").trim().toLowerCase();
}

/**
 * Discover the commit that public verification is meant to certify.
 *
 * @returns {string} Intended deployment commit.
 */
function intendedCommitSha() {
	const configuredSha = normalizeCommitSha(process.env.EXPECTED_SHA);
	if (configuredSha) {
		return configuredSha;
	}
	return normalizeCommitSha(execFileSync("git", ["rev-parse", "HEAD"], {
		encoding: "utf8"
	}));
}

/**
 * Assert that public bundle identity is consistent with the intended release.
 *
 * Exact live-service identity remains preferred. A stale live-service SHA is
 * accepted only when the Awtsmoos-guided release vessel proves the entire Git
 * transition is an approved static-only range. Bundle bytes and immutable
 * manifest ancestry remain independently strict.
 *
 * @param {object} publicDescriptor Descriptor fetched from production.
 * @param {object} manifestDescriptor Descriptor sealed by the repository.
 * @param {object} [options] Test-only dependency overrides.
 * @param {Function} [options.staticReleaseCheck] Static transition predicate.
 * @returns {string} Intended deployed commit SHA.
 */
export function assertPublicReleaseIdentity(publicDescriptor, manifestDescriptor, options = {}) {
	const deployedCommit = intendedCommitSha();
	assert.match(deployedCommit, COMMIT_SHA_PATTERN, "intended deployed source SHA invalid");
	const serviceCommit = normalizeCommitSha(publicDescriptor?.releaseSourceSha);
	assert.match(serviceCommit, COMMIT_SHA_PATTERN, "public deployed source SHA invalid");
	const staticReleaseCheck = options.staticReleaseCheck || isApprovedStaticReleaseTransition;
	const exactServiceIdentity = serviceCommit === deployedCommit;
	const approvedStaticTransition = exactServiceIdentity
		? false
		: Boolean(staticReleaseCheck(serviceCommit, deployedCommit));
	assert.ok(
		exactServiceIdentity || approvedStaticTransition,
		"public deployed source SHA differs from intended commit and transition is not approved static-only"
	);
	const manifestSourceSha = normalizeCommitSha(manifestDescriptor?.releaseSourceSha);
	assert.match(manifestSourceSha, COMMIT_SHA_PATTERN, "manifest source anchor invalid");
	assert.deepEqual(
		{ ...publicDescriptor, releaseSourceSha: manifestSourceSha },
		manifestDescriptor,
		"public bundle descriptor differs from sealed release"
	);
	return deployedCommit;
}
