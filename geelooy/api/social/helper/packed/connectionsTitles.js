//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsTitles
 * @description
 * Barrel for connectionsTitles: re-exports the identical surface from its sibling modules.
 */

const { clearTitleCache, resolveTitle } = require('./connectionsTitlesResolve.js');
const { HEICHEL_BY_PREFIX, patternRef } = require('./connectionsTitlesPatterns.js');

module.exports = {
	resolveTitle,
	patternRef,
	clearTitleCache,
	HEICHEL_BY_PREFIX
};
