// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicShardShape
 * @description
 * The Awtsmoos lets corpus capability truth appear without leaking backend-shaped provider names into learner sight;
 * Awtsmoos.com exposes counts, modes, index state, and a neutral query key while private publication machinery remains wrapped in night.
 */

const {
	publicCorpusAliases,
	publicCorpusTitle,
	publicLaneId
} = require('./publicSourceIdentity.js');
const { firstText } = require('./resultText.js');

function searchModes(shard) {
	const modes = [];
	if (shard.textFile || shard.parts?.some(part => part.textFile)) {
		modes.push('text');
	}
	if (!shard.textOnly && shard.storedVectors) {
		modes.push('vector-exact');
	}
	if (!shard.textOnly && shard.indexed) {
		modes.push('vector-indexed');
	}
	return modes;
}

function publicShard(shard = {}) {
	const partial = shard.partial === true;
	const storedVectors = Boolean(
		shard.listName
		&& Number(shard.dimensions || 0) > 0
	) || shard.indexType === 'flat-f32';
	const indexed = shard.vectorEnabled === true;
	const rawTitle = firstText(
		shard.title,
		shard.label,
		shard.id,
		'Indexed library'
	);
	return {
		id: publicLaneId(shard),
		title: publicCorpusTitle(shard, rawTitle),
		aliases: publicCorpusAliases(shard),
		count: Number(shard.count || 0),
		dimensions: Number(shard.dimensions || 0),
		bytes: Number(shard.bytes || 0),
		storedVectors,
		indexed,
		indexType: shard.indexType || (indexed ? 'hnsw' : null),
		modes: searchModes({
			...shard,
			storedVectors,
			indexed
		}),
		available: !shard.error,
		partial,
		completeParts: Number(
			shard.completeParts || (partial ? 0 : 1)
		),
		expectedParts: Number(shard.expectedParts || 1),
		publicationStatus: shard.publicationStatus
			|| (partial ? 'partial' : 'complete'),
		textOnly: shard.textOnly === true,
		error: shard.error ? String(shard.error) : undefined
	};
}

module.exports = {
	publicShard,
	searchModes
};
