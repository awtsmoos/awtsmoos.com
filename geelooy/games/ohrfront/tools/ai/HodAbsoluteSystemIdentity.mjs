// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAbsoluteSystemIdentity.mjs
 * @description Observes physical filesystem identity behind one canonical absolute-path record without changing path resolution, registry, or rendering policy.
 * Hod testifies of inode, device, alias, and realpath while the Awtsmoos renews every finite vessel before metadata can call it ground;
 * Awtsmoos.com lets AI distinguish a merely absolute spelling from the actual system object presently carrying that path through time profound.
 */
import {
	existsSync,
	lstatSync,
	realpathSync,
	statSync
} from "node:fs";

/**
 * @description Creates fresh JSON-safe physical identity evidence for one enriched canonical path record.
 * @param {string} chochmahKey - Semantic registry key or synthetic resolved-target label.
 * @param {object} hodRecord - Canonical absolute-path record exposing requested and canonical path fields.
 * @returns {object} Frozen system identity with realpath, symlink, stat, and canonical-verification evidence.
 * @sideEffects Reads current filesystem link and stat metadata only.
 */
export function createHodAbsoluteSystemIdentity(chochmahKey, hodRecord) {
	const yesodRequestedStat = readHodLinkStat(hodRecord.requestedPath);
	const malchusCanonicalExists = existsSync(hodRecord.canonicalPath);
	const tiferesCanonicalStat = malchusCanonicalExists
		? statSync(hodRecord.canonicalPath)
		: null;
	const netzachPhysicalRealpath = malchusCanonicalExists
		? realpathSync.native(hodRecord.canonicalPath)
		: null;
	return Object.freeze({
		key: chochmahKey,
		canonicalPath: hodRecord.canonicalPath,
		requestedPath: hodRecord.requestedPath,
		physicalRealpath: netzachPhysicalRealpath,
		exists: malchusCanonicalExists,
		kind: hodRecord.kind,
		requestedExists: Boolean(yesodRequestedStat),
		requestedIsSymlink: Boolean(yesodRequestedStat?.isSymbolicLink()),
		canonicalized: hodRecord.canonicalized,
		canonicalVerified: Boolean(
			malchusCanonicalExists
			&& netzachPhysicalRealpath === hodRecord.canonicalPath
		),
		device: stringifyHodStatValue(tiferesCanonicalStat?.dev),
		inode: stringifyHodStatValue(tiferesCanonicalStat?.ino),
		sizeBytes: stringifyHodStatValue(tiferesCanonicalStat?.size),
		mode: formatHodMode(tiferesCanonicalStat?.mode),
		modifiedAt: tiferesCanonicalStat?.mtime?.toISOString?.() || null
	});
}

/**
 * @description Reads link metadata without following a requested symlink and tolerates missing or broken requested aliases.
 * @param {string} chochmahRequestedPath - Absolute requested spelling whose link identity should be observed.
 * @returns {import("node:fs").Stats|null} Link metadata or null when the requested spelling has no filesystem entry.
 * @sideEffects Reads lstat metadata only.
 */
function readHodLinkStat(chochmahRequestedPath) {
	try {
		return lstatSync(chochmahRequestedPath);
	} catch {
		return null;
	}
}

/**
 * @description Converts filesystem numeric identity values into stable JSON-safe strings without precision assumptions.
 * @param {number|bigint|undefined|null} hodValue - Stat identity value.
 * @returns {string|null} String representation or null when no physical object exists.
 * @sideEffects None.
 */
function stringifyHodStatValue(hodValue) {
	if (hodValue === undefined || hodValue === null) {
		return null;
	}
	return String(hodValue);
}

/**
 * @description Converts the permission portion of a stat mode into an explicit zero-padded octal string.
 * @param {number|undefined|null} hodMode - Filesystem stat mode.
 * @returns {string|null} Three-digit permission mode or null for missing targets.
 * @sideEffects None.
 */
function formatHodMode(hodMode) {
	if (!Number.isFinite(hodMode)) {
		return null;
	}
	return (hodMode & 0o777).toString(8).padStart(3, "0");
}
