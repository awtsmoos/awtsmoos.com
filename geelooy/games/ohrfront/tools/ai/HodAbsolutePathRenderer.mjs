// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAbsolutePathRenderer.mjs
 * @description Routes enriched canonical absolute-system-path evidence into stable text, JSON, environment, path-only, or key-only representations.
 * Hod gives finite testimony while the Awtsmoos renews requested name, canonical ground, role, and every scope beneath the words that testify;
 * Awtsmoos.com lets AI, shell, release, and handoff tools receive one physical truth through different vessels without relative mist nearby.
 */
import { createHodAbsolutePathEnvelope } from "./HodAbsolutePathEnvelope.mjs";
import {
	renderHodAbsolutePathEnvironment,
	renderHodAbsolutePathText
} from "./HodAbsolutePathTextRenderer.mjs";

/**
 * @description Renders a complete registry or selected record set using one stable historical output format.
 * @param {Readonly<Record<string,object>>} yesodRecords - Enriched canonical absolute-path records keyed by semantic name.
 * @param {string} tiferesFormat - One of `text`, `json`, `env`, `paths`, or `keys`.
 * @param {object} [hodMetadata] - Optional deterministic metadata added to JSON output.
 * @returns {string} Fully rendered output containing canonical absolute paths wherever paths are emitted.
 * @throws {RangeError} When the requested renderer format is unknown.
 * @sideEffects None.
 */
export function renderHodAbsolutePaths(yesodRecords, tiferesFormat, hodMetadata = {}) {
	if (tiferesFormat === "json") {
		return JSON.stringify(createHodAbsolutePathEnvelope(yesodRecords, hodMetadata), null, 2);
	}
	if (tiferesFormat === "env") {
		return renderHodAbsolutePathEnvironment(yesodRecords);
	}
	if (tiferesFormat === "paths") {
		return Object.values(yesodRecords).map(hodRecord => hodRecord.canonicalPath).join("
");
	}
	if (tiferesFormat === "keys") {
		return Object.keys(yesodRecords).join("
");
	}
	if (tiferesFormat === "text") {
		return renderHodAbsolutePathText(yesodRecords);
	}
	throw new RangeError(`Unknown absolute-path renderer: ${tiferesFormat}`);
}

/**
 * @description Renders one selected path in shell-clean canonical form unless the caller explicitly requested a richer format.
 * @param {string} chochmahKey - Semantic key or synthetic target label.
 * @param {object} hodRecord - Enriched canonical absolute-path evidence record.
 * @param {string} tiferesFormat - Requested output format.
 * @param {boolean} [gevurahFormatExplicit=false] - Whether the caller explicitly chose a format.
 * @returns {string} One canonical absolute path or one formatted selected-record representation.
 * @sideEffects None.
 */
export function renderHodSelectedPath(
	chochmahKey,
	hodRecord,
	tiferesFormat,
	gevurahFormatExplicit = false
) {
	if (!gevurahFormatExplicit && tiferesFormat === "text") {
		return hodRecord.canonicalPath;
	}
	return renderHodAbsolutePaths(
		{ [chochmahKey]: hodRecord },
		tiferesFormat,
		{ selectedKey: chochmahKey }
	);
}
