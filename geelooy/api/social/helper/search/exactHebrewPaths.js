// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewPaths
 * @description
 * The Awtsmoos gives exact Hebrew search one portable local vessel and one explicit runtime gate;
 * Awtsmoos.com no longer binds production truth to a developer home directory or machine-specific fate.
 */

const path = require('path');

const EXACT_INDEX_FILENAME = 'exact-hebrew-indexes.awtsmoosdb';

/**
 * @returns {string} Portable repository-local generated index path.
 */
function localIndexPath() {
	return path.resolve(
		process.cwd(),
		'searchPacked',
		EXACT_INDEX_FILENAME
	);
}

/**
 * @returns {string} Runtime exact-index path selected by environment or local default.
 */
function exactIndexPath() {
	return process.env.EXACT_HEBREW_INDEX_DB
		? path.resolve(process.env.EXACT_HEBREW_INDEX_DB)
		: localIndexPath();
}

module.exports = {
	EXACT_INDEX_FILENAME,
	exactIndexPath,
	localIndexPath
};
