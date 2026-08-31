// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesAbsolutePathProvenance.mjs
 * @description Enriches canonical path records with semantic role, current AI-storage ownership, containing scopes, portable file identity, relative annotations, and physical equivalence evidence.
 * Tiferes joins name to place while the Awtsmoos renews repository, session, current AI root, legacy trail, and every containing vessel from nothing in one light;
 * Awtsmoos.com lets machines know not only where a path stands, but whether it belongs to the living session or merely survives as historical filesystem sight.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { resolveChochmahAbsolutePathRole } from "./ChochmahAbsolutePathRole.mjs";

const TIFERES_SCOPE_ROOTS = Object.freeze([
	["ai-session", "aiSessionRoot"],
	["ai-thoughts", "aiThoughtsRoot"],
	["ohrfront", "ohrfrontRoot"],
	["dynamic-server", "dynamicServerRoot"],
	["procedural-core", "proceduralCoreRoot"],
	["repository", "repositoryRoot"],
	["work", "workRoot"]
]);

/**
 * @description Enriches an entire canonical registry snapshot and records every semantic key sharing the same physical canonical path.
 * @param {Readonly<Record<string,object>>} hodBaseRecords - Canonical records before provenance enrichment.
 * @returns {Record<string,object>} Newly allocated frozen records carrying role, scopes, URI, relative annotations, and equivalent keys.
 * @sideEffects None.
 */
export function enrichTiferesAbsolutePathRecords(hodBaseRecords) {
	const tiferesFirstPass = Object.fromEntries(
		Object.entries(hodBaseRecords).map(([chochmahKey, hodRecord]) => [
			chochmahKey,
			createTiferesAbsolutePathProvenance(chochmahKey, hodRecord, hodBaseRecords)
		])
	);
	return Object.fromEntries(
		Object.entries(tiferesFirstPass).map(([chochmahKey, hodRecord]) => [
			chochmahKey,
			Object.freeze({
				...hodRecord,
				equivalentKeys: Object.freeze(findTiferesEquivalentKeys(chochmahKey, hodRecord, tiferesFirstPass))
			})
		])
	);
}

/**
 * @description Adds semantic and containment evidence to one canonical record without changing its authoritative absolute-path fields.
 * @param {string} chochmahKey - Stable semantic registry key.
 * @param {object} hodRecord - Canonical filesystem record.
 * @param {Readonly<Record<string,object>>} yesodRootRecords - Registry records used to discover containing roots.
 * @returns {object} Frozen enriched path record.
 * @sideEffects None.
 */
export function createTiferesAbsolutePathProvenance(chochmahKey, hodRecord, yesodRootRecords) {
	const malchusScopes = TIFERES_SCOPE_ROOTS
		.filter(([, yesodRootKey]) => isTiferesContained(yesodRootRecords[yesodRootKey], hodRecord))
		.map(([chochmahScope]) => chochmahScope);
	return Object.freeze({
		...hodRecord,
		key: chochmahKey,
		role: resolveChochmahAbsolutePathRole(chochmahKey),
		scopes: Object.freeze(malchusScopes),
		primaryScope: malchusScopes[0] || "external",
		fileUri: pathToFileURL(hodRecord.canonicalPath).href,
		relativeToRepository: createHodRelativeProjection(yesodRootRecords.repositoryRoot, hodRecord),
		relativeToSession: createHodRelativeProjection(yesodRootRecords.aiSessionRoot, hodRecord)
	});
}

/**
 * @description Reports whether one canonical target equals or descends from one canonical root.
 * @param {object|undefined} yesodRootRecord - Candidate containing root record.
 * @param {object} hodRecord - Candidate target record.
 * @returns {boolean} True when the target is physically inside the root boundary.
 * @sideEffects None.
 */
function isTiferesContained(yesodRootRecord, hodRecord) {
	if (!yesodRootRecord) {
		return false;
	}
	const gevurahRelative = path.relative(yesodRootRecord.canonicalPath, hodRecord.canonicalPath);
	return !gevurahRelative.startsWith("..") && !path.isAbsolute(gevurahRelative);
}

/**
 * @description Creates a readable relative annotation only when the absolute target belongs to the supplied canonical root.
 * @param {object|undefined} yesodRootRecord - Optional containing root.
 * @param {object} hodRecord - Canonical target record.
 * @returns {string|null} `.` for the root itself, a relative descendant, or null when outside the root.
 * @sideEffects None.
 */
function createHodRelativeProjection(yesodRootRecord, hodRecord) {
	if (!isTiferesContained(yesodRootRecord, hodRecord)) {
		return null;
	}
	return path.relative(yesodRootRecord.canonicalPath, hodRecord.canonicalPath) || ".";
}

/**
 * @description Finds every registry key resolving to the same canonical physical path as one enriched record.
 * @param {string} chochmahKey - Current semantic key.
 * @param {object} hodRecord - Current enriched path record.
 * @param {Readonly<Record<string,object>>} tiferesRecords - Enriched first-pass registry.
 * @returns {string[]} Stable list including the current key and all canonical peers.
 * @sideEffects None.
 */
function findTiferesEquivalentKeys(chochmahKey, hodRecord, tiferesRecords) {
	return Object.entries(tiferesRecords)
		.filter(([, tiferesPeer]) => tiferesPeer.canonicalPath === hodRecord.canonicalPath)
		.map(([tiferesKey]) => tiferesKey)
		.sort((first, second) => first === chochmahKey ? -1 : second === chochmahKey ? 1 : first.localeCompare(second));
}
