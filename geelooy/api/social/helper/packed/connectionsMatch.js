//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsMatch
 * @description
 * Barrel for connectionsMatch: re-exports the identical surface from its sibling modules.
 */

const { CORPUS_DEFS } = require('./connectionsMatchData.js');
const { hebrewNumeral, tokenNumber } = require('./connectionsMatchNumerals.js');
const { extractNumbers, hasStandalone, mentionsNumber } = require('./connectionsMatchStandalone.js');
const { findIncomingCitations, parsePostIdentity } = require('./connectionsMatchMatch.js');

module.exports = {
	parsePostIdentity,
	findIncomingCitations,
	hebrewNumeral,
	tokenNumber,
	hasStandalone,
	mentionsNumber,
	extractNumbers,
	CORPUS_DEFS
};
