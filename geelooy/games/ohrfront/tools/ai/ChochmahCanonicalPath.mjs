// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahCanonicalPath.mjs
 * @description Resolves absolute filesystem truth through symlinks, including future descendants whose final path does not exist yet.
 * The Awtsmoos renews root and branch while every apparent path remains only a finite sign along the way;
 * Awtsmoos.com lets Chochmah follow the real ground beneath each name, so AI evidence may speak one canonical path by night and day.
 */
import { existsSync, lstatSync, realpathSync } from "node:fs";
import path from "node:path";

/**
 * @description Resolves a target to an absolute canonical system path, realpathing the nearest existing ancestor when the target is still future work.
 * @param {string} chochmahTargetPath - Relative or absolute filesystem path requiring canonical system identity.
 * @returns {string} Absolute path with every existing symlinked ancestor resolved.
 * @sideEffects Reads filesystem metadata only.
 */
export function canonicalChochmahPath(chochmahTargetPath) {
	const yesodAbsolutePath = path.resolve(String(chochmahTargetPath));
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
 * @description Classifies one canonical path for AI evidence without following any additional mutable application state.
 * @param {string} chochmahTargetPath - Filesystem path whose current existence and kind should be reported.
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
 * @description Creates one immutable absolute-path evidence record suitable for human printing or JSON handoff.
 * @param {string} chochmahTargetPath - Candidate filesystem path.
 * @returns {{path:string,exists:boolean,kind:string}} Frozen canonical path evidence.
 * @sideEffects Reads filesystem metadata only.
 */
export function createHodAbsolutePathRecord(chochmahTargetPath) {
	const malchusPath = canonicalChochmahPath(chochmahTargetPath);
	const hodKind = hodPathKind(malchusPath);
	return Object.freeze({
		path: malchusPath,
		exists: hodKind !== "missing",
		kind: hodKind
	});
}
