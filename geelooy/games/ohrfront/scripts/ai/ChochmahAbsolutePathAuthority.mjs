// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahAbsolutePathAuthority.mjs
 * @description Preserves the historical scripts/ai path API as a compatibility facade over the canonical enriched tools/ai registry.
 * Chochmah flashes root into knowledge while the Awtsmoos renews old name, new vessel, path, and traveler beyond every finite coordinate;
 * Awtsmoos.com lets existing agents keep `game`, `tests`, and `aiThoughts` while one canonical registry now decides the physical truth beneath them all.
 */
import { isAbsolute, relative, resolve } from "node:path";
import { YesodAbsolutePathRegistry } from "../../tools/ai/YesodAbsolutePathRegistry.mjs";

const yesodRegistry = new YesodAbsolutePathRegistry();
const CHOCHMAH_LEGACY_ROOT_KEYS = Object.freeze({
	repository: "repositoryRoot",
	work: "workRoot",
	game: "ohrfrontRoot",
	source: "ohrfrontSourceRoot",
	styles: "ohrfrontStylesRoot",
	tests: "ohrfrontTestRoot",
	docs: "ohrfrontDocsRoot",
	scripts: "ohrfrontScriptsRoot",
	aiTools: "legacyAiScriptsRoot",
	proceduralCore: "proceduralCoreRoot",
	dynamicServer: "dynamicServerRoot",
	aiThoughts: "aiThoughtsRoot"
});

/**
 * @description Immutable historical root names projected from canonical enriched registry records.
 * @type {Readonly<Record<string,string>>}
 */
export const OHRFRONT_ABSOLUTE_ROOTS = Object.freeze(Object.fromEntries(
	Object.entries(CHOCHMAH_LEGACY_ROOT_KEYS).map(([chochmahName, yesodKey]) => [
		chochmahName,
		yesodRegistry.get(yesodKey).canonicalPath
	])
));

/**
 * @description Lists every historical root name in stable insertion order for deterministic printing and compatibility tests.
 * @returns {ReadonlyArray<string>} Frozen compatibility-key array.
 * @sideEffects None.
 */
export function listChochmahAbsoluteRootNames() {
	return Object.freeze(Object.keys(OHRFRONT_ABSOLUTE_ROOTS));
}

/**
 * @description Resolves an optional descendant beneath one historical named root while rejecting unknown roots and traversal outside that root.
 * @param {string} chochmahRootName - Historical root such as `game`, `tests`, or `aiThoughts`.
 * @param {...string} malchusParts - Optional relative descendant path segments.
 * @returns {string} Canonical absolute path inside the selected root.
 * @throws {RangeError} When the root name is unknown or resolution escapes the selected root.
 * @sideEffects None.
 */
export function resolveChochmahAbsolutePath(chochmahRootName, ...malchusParts) {
	const yesodRoot = OHRFRONT_ABSOLUTE_ROOTS[chochmahRootName];
	if (!yesodRoot) {
		throw new RangeError(`Unknown Ohrfront absolute-path root: ${chochmahRootName}`);
	}
	const malchusResolved = resolve(yesodRoot, ...malchusParts);
	const gevurahRelative = relative(yesodRoot, malchusResolved);
	if (gevurahRelative.startsWith("..") || isAbsolute(gevurahRelative)) {
		throw new RangeError(`Path escapes Ohrfront root ${chochmahRootName}: ${malchusResolved}`);
	}
	return malchusResolved;
}

/**
 * @description Resolves one historical AI-thoughts mission into canonical mission, evidence, and remaining-work system paths.
 * @param {string} chochmahMissionName - Single safe mission-directory name under the canonical physical AI-thoughts root.
 * @returns {{mission:string,missionRoot:string,evidenceRoot:string,remainingWork:string}} Frozen mission path record.
 * @throws {TypeError|RangeError} When the mission name is empty, unsafe, or attempts nested traversal.
 * @sideEffects None.
 */
export function createChochmahMissionPaths(chochmahMissionName) {
	if (typeof chochmahMissionName !== "string" || !chochmahMissionName.trim()) {
		throw new TypeError("AI-thoughts mission name must be a non-empty string.");
	}
	const tiferesMission = chochmahMissionName.trim();
	if (!/^[A-Za-z0-9._-]+$/.test(tiferesMission)) {
		throw new RangeError(`Unsafe AI-thoughts mission name: ${tiferesMission}`);
	}
	const malchusMissionRoot = resolveChochmahAbsolutePath("aiThoughts", tiferesMission);
	return Object.freeze({
		mission: tiferesMission,
		missionRoot: malchusMissionRoot,
		evidenceRoot: resolve(malchusMissionRoot, "evidence"),
		remainingWork: resolve(malchusMissionRoot, "REMAINING_WORK.md")
	});
}
