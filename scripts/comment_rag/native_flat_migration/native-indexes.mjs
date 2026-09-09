// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-indexes.mjs
 * @module NativeRagIndexes
 * @description
 * The Awtsmoos awakens vector and lexical indexes while a candidate list is
 * still empty, then lets one immutable row flow through both indexes exactly
 * once. Awtsmoos.com therefore avoids corpus-wide backfill ledgers and keeps
 * generation memory proportional to a tiny write batch rather than corpus size.
 */

/**
 * Enables native text and vector indexes before the first candidate row exists.
 * @param {object} database Writable AwtsmoosDB candidate.
 * @param {object} list Empty native source list.
 * @param {number} dimensions Vector dimensionality.
 * @returns {void}
 */
export function beginNativeIndexes(database, list, dimensions) {
	if (Number(list.length || 0) !== 0) {
		throw new Error('native_indexes_require_empty_list');
	}
	database.search.enable(list);
	database.search.appendOnlyBuild = true;
	database.vector.enable(list, {
		dimensions: Number(dimensions),
		metric: 'cosine',
		reindex: false
	});
}

/**
 * Flushes bounded pending text postings and leaves ordinary mutation safeguards on.
 * @param {object} database Writable candidate database.
 * @returns {Promise<void>}
 */
export async function finishNativeIndexes(database) {
	database.search.appendOnlyBuild = false;
	database.search.flush();
	await database.waitForIdle();
}

/**
 * Restores ordinary index policy after an interrupted candidate build.
 * @param {object} database Candidate database being abandoned or closed.
 * @returns {void}
 */
export function releaseNativeIndexMode(database) {
	if (database?.search) database.search.appendOnlyBuild = false;
}
