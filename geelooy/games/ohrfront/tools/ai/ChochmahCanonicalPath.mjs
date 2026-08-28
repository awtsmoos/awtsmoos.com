// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahCanonicalPath.mjs
 * @description Resolves absolute filesystem truth through symlinks, preserves requested provenance, and exposes explicit canonical path anatomy for AI and release tooling.
 * The Awtsmoos renews name and ground while every pathname is only a finite sign along the way;
 * Awtsmoos.com lets requested spelling stand beside canonical physical truth, so no future agent mistakes alias, branch, parent, or file for the root of light.
 */
import { existsSync, lstatSync, realpathSync } from "node:fs";
import path from "node:path";

/**
 * @description Converts one candidate into an absolute normalized requested path using an explicit base only when the candidate is relative.
 * @param {string} chochmahTargetPath - Relative or absolute filesystem candidate.
 * @param {string} [yesodBasePath=process.cwd()] - Base used only for relative candidates.
 * @returns {string} Absolute normalized requested spelling before symlink canonicalization.
 * @sideEffects None.
 */
export function absoluteChochmahPath(chochmahTargetPath, yesodBasePath = process.cwd()) {
	const malchusTarget = String(chochmahTargetPath);
	if (path.isAbsolute(malchusTarget)) {
		return path.normalize(malchusTarget);
	}
	return path.resolve(String(yesodBasePath), malchusTarget);
}

/**
 * @description Resolves a target to canonical system identity, realpathing the nearest existing ancestor when the final target is future work.
 * @param {string} chochmahTargetPath - Relative or absolute filesystem path requiring canonical identity.
 * @param {string} [yesodBasePath=process.cwd()] - Explicit base for relative targets.
 * @returns {string} Absolute path with every existing symlinked ancestor resolved.
 * @sideEffects Reads filesystem existence and realpath metadata only.
 */
export function canonicalChochmahPath(chochmahTargetPath, yesodBasePath = process.cwd()) {
	const yesodAbsolutePath = absoluteChochmahPath(chochmahTargetPath, yesodBasePath);
	if (existsSync(yesodAbsolutePath)) {
		return realpathSync.native(yesodAbsolutePath);
	}
	const malchusMissingSegments = [];
	let netzachCursor = yesodAbsolutePath;
	while (!existsSync(netzachCursor)) {
		const hodParent = path.dirname(netzachCursor);
		if (hodParent === netzachCursor) {
			break;
		}
		malchusMissingSegments.unshift(path.basename(netzachCursor));
		netzachCursor = hodParent;
	}
	const tiferesExistingRoot = existsSync(netzachCursor)
		? realpathSync.native(netzachCursor)
		: path.parse(yesodAbsolutePath).root;
	return path.join(tiferesExistingRoot, ...malchusMissingSegments);
}

/**
 * @description Classifies one filesystem path without following application-level semantics.
 * @param {string} chochmahTargetPath - Absolute or relative path whose current kind should be reported.
 * @returns {"directory"|"file"|"other"|"missing"} Stable coarse filesystem kind.
 * @sideEffects Reads filesystem metadata only.
 */
export function hodPathKind(chochmahTargetPath) {
	if (!existsSync(chochmahTargetPath)) {
		return "missing";
	}
	const hodStats = lstatSync(chochmahTargetPath);
	if (hodStats.isDirectory()) {
		return "directory";
	}
	if (hodStats.isFile()) {
		return "file";
	}
	return "other";
}

/**
 * @description Creates immutable absolute-path evidence with backward-compatible `path` plus explicit canonical identity and path anatomy.
 * @param {string} chochmahTargetPath - Candidate filesystem path.
 * @param {string} [yesodBasePath=process.cwd()] - Explicit base for relative candidates.
 * @returns {object} Frozen requested/canonical path evidence with existence, kind, parent, basename, and extension data.
 * @sideEffects Reads filesystem metadata only.
 */
export function createHodAbsolutePathRecord(chochmahTargetPath, yesodBasePath = process.cwd()) {
	const yesodRequestedPath = absoluteChochmahPath(chochmahTargetPath, yesodBasePath);
	const malchusCanonicalPath = canonicalChochmahPath(yesodRequestedPath);
	const hodKind = hodPathKind(malchusCanonicalPath);
	const hodExists = hodKind !== "missing";
	return Object.freeze({
		requestedPath: yesodRequestedPath,
		path: malchusCanonicalPath,
		canonicalPath: malchusCanonicalPath,
		parentPath: path.dirname(malchusCanonicalPath),
		basename: path.basename(malchusCanonicalPath),
		extension: path.extname(malchusCanonicalPath),
		exists: hodExists,
		kind: hodKind,
		isAbsolute: path.isAbsolute(malchusCanonicalPath),
		canonicalized: yesodRequestedPath !== malchusCanonicalPath,
		canonicalVerified: hodExists && realpathSync.native(malchusCanonicalPath) === malchusCanonicalPath
	});
}
