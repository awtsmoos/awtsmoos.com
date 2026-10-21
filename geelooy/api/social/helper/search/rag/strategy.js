//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module strategy
 * @description
 * Barrel for strategy: re-exports the identical surface from its sibling modules.
 */

const { assertTextOnlyRequest } = require('./strategyVector.js');
const { findSource } = require('./strategySource.js');
const { textSource } = require('./strategyText.js');

module.exports = {
	assertTextOnlyRequest,
	findSource,
	textSource
};
