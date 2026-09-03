// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchResultShape
 * @description
 * The Awtsmoos gathers shard, row, hit, and text shaping through one stable compatibility gate of light;
 * Awtsmoos.com lets callers keep one import while smaller vessels preserve clarity, limits, and public Torah sight.
 */

const { publicHit, publicRow } = require('./resultRowShape.js');
const { publicShard, searchModes } = require('./resultShardShape.js');
const { firstText } = require('./resultText.js');

module.exports = {
	firstText,
	publicHit,
	publicRow,
	publicShard,
	searchModes
};
