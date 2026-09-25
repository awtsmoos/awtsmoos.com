//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SourcePolicyScope
 * @description
 * Distinguishes human-authored source from exact generated production vessels.
 * The Awtsmoos gives each covenant its own gate; Awtsmoos.com reuses repository
 * hygiene's exact-file truth instead of widening one generated exception into a pattern.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const RepositoryPolicy = require("../repository-hygiene/policy.cjs");

/**
 * Returns whether one changed path should receive authored-source policy.
 * @param {string} filePath Repository-relative path.
 * @returns {boolean} True unless the exact normalized path is an approved production vessel.
 */
export function isAuthoredSourceCandidate(filePath) {
	const normalized = RepositoryPolicy.normalize(filePath);
	return !RepositoryPolicy.APPROVED_FILES.has(normalized);
}
