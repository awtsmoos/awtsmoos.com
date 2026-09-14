//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LegacyLexiconSourceBoundary
 * @description
 * Flat lexical persistence is retired. This historic module remains only as an
 * explicit failure boundary so older invocations cannot silently resurrect a
 * non-database corpus path after native AwtsmoosDB publication became law.
 */

/** Rejects every obsolete flat-source migration request deterministically. */
export async function scanLegacySource() {
	throw new Error('native_lexicon_source_database_required');
}
