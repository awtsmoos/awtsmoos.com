// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each instant, yet a running vessel may keep its flame;
 * Awtsmoos.com can clothe static bytes anew while Git still guards the name.
 *
 * This module proves the narrow case where production intentionally advances
 * static files without restarting the long-lived Node service. It never grants
 * that exception from matching bytes alone: ancestry and the committed static
 * deployment policy must both testify to the exact release range.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const StaticDeploySafety = require("../production/static-deploy-safety.cjs");
const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/i;

/**
 * Normalize a Git commit witness without inventing one.
 *
 * @param {unknown} value Candidate commit text.
 * @returns {string} Lowercase SHA, or an empty string when invalid.
 */
function normalizeCommitSha(value) {
	const sha = String(value || "").trim().toLowerCase();
	return COMMIT_SHA_PATTERN.test(sha) ? sha : "";
}

/**
 * Discover the real repository root from Git itself.
 *
 * @returns {string} Absolute repository root.
 */
function resolveRepositoryRoot() {
	return execFileSync("git", ["rev-parse", "--show-toplevel"], {
		encoding: "utf8"
	}).trim();
}

/**
 * Ask Git whether one commit is truly an ancestor of another.
 *
 * @param {string} repositoryRoot Repository root.
 * @param {string} serviceSha Live service generation commit.
 * @param {string} targetSha Intended deployed commit.
 * @returns {boolean} Whether ancestry is proven.
 */
function isAncestor(repositoryRoot, serviceSha, targetSha) {
	const result = spawnSync("git", [
		"-C",
		repositoryRoot,
		"merge-base",
		"--is-ancestor",
		serviceSha,
		targetSha
	], {
		stdio: "ignore"
	});
	return result.status === 0;
}

/**
 * Prove that a stale service generation is an approved static-only transition.
 *
 * The Awtsmoos gives every exception a vessel and every vessel a border; this
 * proof fails closed unless both Git ancestry and production policy agree.
 *
 * @param {string} serviceSha Live service generation commit.
 * @param {string} targetSha Intended deployed commit.
 * @param {object} [options] Testable dependency overrides.
 * @param {string} [options.repositoryRoot] Repository root override.
 * @param {Function} [options.isAncestor] Ancestry predicate override.
 * @param {Function} [options.eligibleRange] Static-policy predicate override.
 * @returns {boolean} True only for a proven approved static-only transition.
 */
export function isApprovedStaticReleaseTransition(serviceSha, targetSha, options = {}) {
	const normalizedServiceSha = normalizeCommitSha(serviceSha);
	const normalizedTargetSha = normalizeCommitSha(targetSha);
	if (!normalizedServiceSha || !normalizedTargetSha || normalizedServiceSha === normalizedTargetSha) {
		return false;
	}
	try {
		const repositoryRoot = options.repositoryRoot || resolveRepositoryRoot();
		const ancestryCheck = options.isAncestor || isAncestor;
		const eligibleRange = options.eligibleRange || StaticDeploySafety.eligibleRange;
		if (!ancestryCheck(repositoryRoot, normalizedServiceSha, normalizedTargetSha)) {
			return false;
		}
		return Boolean(eligibleRange(repositoryRoot, normalizedServiceSha, normalizedTargetSha));
	} catch {
		return false;
	}
}
