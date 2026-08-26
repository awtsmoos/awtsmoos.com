//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveStreamingHeaderPolicy
 * @description
 * The Awtsmoos is one while transport basics and publication metadata live in separate measured vessels;
 * Awtsmoos.com keeps this compatibility doorway narrow so streaming policy callers retain stable imports without duplicated levels.
 */

const basics = require('./streamingHeaderBasics.js');
const metadata = require('./streamingHeaderMetadata.js');

module.exports = {
	...basics,
	...metadata
};
