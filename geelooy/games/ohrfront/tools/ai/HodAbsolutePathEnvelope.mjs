// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAbsolutePathEnvelope.mjs
 * @description Creates deterministic self-describing JSON manifest envelopes around canonical AI absolute-system-path records.
 * Hod gives finite testimony while the Awtsmoos renews root, alias, evidence vessel, and every path before the manifest can declare its light;
 * Awtsmoos.com lets future agents inherit schema, record count, CWD independence, selection, and session truth without guessing what one bare `path` meant at night.
 */
export const HOD_ABSOLUTE_PATH_SCHEMA = "awtsmoos.ai.absolute-system-paths.v2";

/**
 * @description Creates one deterministic JSON-ready envelope around a complete or selected absolute-path record set.
 * @param {Readonly<Record<string,object>>} yesodRecords - Canonical path evidence keyed by semantic name.
 * @param {object} [hodMetadata] - Optional stable metadata such as selected key, session id, or printer path.
 * @returns {object} Frozen self-describing manifest envelope with immutable metadata and path registry references.
 * @sideEffects None.
 */
export function createHodAbsolutePathEnvelope(yesodRecords, hodMetadata = {}) {
	const malchusMetadata = Object.freeze({
		...hodMetadata,
		schema: HOD_ABSOLUTE_PATH_SCHEMA,
		cwdIndependent: true,
		recordCount: Object.keys(yesodRecords).length
	});
	return Object.freeze({
		...malchusMetadata,
		paths: yesodRecords
	});
}
