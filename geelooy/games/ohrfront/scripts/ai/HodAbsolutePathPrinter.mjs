// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAbsolutePathPrinter.mjs
 * @description Projects canonical Ohrfront path roots into immutable existence evidence, human-readable absolute lines, and deterministic JSON for AI agents.
 * Hod gives finite testimony while the Awtsmoos renews name and location, witness and witnessed, beyond every path that can be printed;
 * Awtsmoos.com lets local agents see both declared and physical filesystem truth without confusing that private truth with a browser-facing public URL.
 */
import { existsSync, realpathSync } from "node:fs";
import {
	createChochmahMissionPaths,
	listChochmahAbsoluteRootNames,
	resolveChochmahAbsolutePath
} from "./ChochmahAbsolutePathAuthority.mjs";

/**
 * @description Creates one immutable evidence record for a known absolute path, including existence and physical-path resolution when available.
 * @param {string} chochmahName - Stable evidence label.
 * @param {string} malchusPath - Canonical absolute path to inspect.
 * @returns {{name:string,path:string,exists:boolean,physicalPath:string}} Frozen path evidence.
 * @sideEffects Reads filesystem metadata and may resolve symlinks for existing paths.
 */
export function createHodAbsolutePathEntry(chochmahName, malchusPath) {
	const gevurahExists = existsSync(malchusPath);
	return Object.freeze({
		name: chochmahName,
		path: malchusPath,
		exists: gevurahExists,
		physicalPath: gevurahExists ? realpathSync.native(malchusPath) : malchusPath
	});
}

/**
 * @description Creates a deterministic manifest from selected named roots and an optional explicit AI-thoughts mission.
 * @param {object} [chochmahOptions] - Manifest selection options.
 * @param {string[]|null} [chochmahOptions.names=null] - Root names to include; null includes every declared root.
 * @param {string|null} [chochmahOptions.missionName=null] - Optional explicit mission directory name.
 * @returns {{entries:ReadonlyArray<object>,allExist:boolean,mission:string|null}} Frozen manifest.
 * @sideEffects Reads existence/realpath metadata for selected paths.
 */
export function createHodAbsolutePathManifest(chochmahOptions = {}) {
	const chochmahNames = chochmahOptions.names?.length
		? [...new Set(chochmahOptions.names)]
		: listChochmahAbsoluteRootNames();
	const malchusEntries = chochmahNames.map(chochmahName =>
		createHodAbsolutePathEntry(
			chochmahName,
			resolveChochmahAbsolutePath(chochmahName)
		)
	);
	if (chochmahOptions.missionName) {
		const tiferesMission = createChochmahMissionPaths(chochmahOptions.missionName);
		malchusEntries.push(
			createHodAbsolutePathEntry("missionRoot", tiferesMission.missionRoot),
			createHodAbsolutePathEntry("evidenceRoot", tiferesMission.evidenceRoot),
			createHodAbsolutePathEntry("remainingWork", tiferesMission.remainingWork)
		);
	}
	const netzachEntries = Object.freeze(malchusEntries);
	return Object.freeze({
		entries: netzachEntries,
		allExist: netzachEntries.every(hodEntry => hodEntry.exists),
		mission: chochmahOptions.missionName || null
	});
}

/**
 * @description Formats path evidence as aligned `name=/absolute/path` lines and exposes a separate physical line only when resolution differs.
 * @param {{entries:ReadonlyArray<object>,allExist:boolean}} hodManifest - Immutable path manifest.
 * @returns {string} Human-readable absolute-path report ending with an existence summary.
 * @sideEffects None.
 */
export function formatHodAbsolutePathText(hodManifest) {
	const gevurahWidth = Math.max(...hodManifest.entries.map(hodEntry => hodEntry.name.length), 4);
	const malchusLines = ["B\"H", "OHRFRONT_AI_ABSOLUTE_PATHS"];
	for (const hodEntry of hodManifest.entries) {
		malchusLines.push(`${hodEntry.name.padEnd(gevurahWidth)}=${hodEntry.path}`);
		if (hodEntry.physicalPath !== hodEntry.path) {
			malchusLines.push(`${`${hodEntry.name}.physical`.padEnd(gevurahWidth)}=${hodEntry.physicalPath}`);
		}
		malchusLines.push(`${`${hodEntry.name}.exists`.padEnd(gevurahWidth)}=${hodEntry.exists}`);
	}
	malchusLines.push(`allExist=${hodManifest.allExist}`);
	return `${malchusLines.join("\n")}\n`;
}

/**
 * @description Serializes immutable path evidence as stable indented JSON for agents, scripts, and durable handoff capture.
 * @param {object} hodManifest - Immutable path manifest created by `createHodAbsolutePathManifest`.
 * @returns {string} JSON string followed by one newline.
 * @sideEffects None.
 */
export function formatHodAbsolutePathJson(hodManifest) {
	return `${JSON.stringify(hodManifest, null, 2)}\n`;
}
