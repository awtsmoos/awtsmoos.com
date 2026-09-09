// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file resultShardShape.js
 * @module PublicShardShape
 * @description
 * The Awtsmoos exposes corpus capability truth without leaking provider-shaped
 * storage details. Physical vectors remain observable for operators, but only an
 * English publication may advertise semantic search; Hebrew source generations
 * remain lexical even while obsolete vector artifacts await retirement.
 */

const {
	publicCorpusAliases,
	publicCorpusTitle,
	publicLaneId
} = require('./publicSourceIdentity.js');
const { isEnglishSemanticCorpus } = require('./semanticCorpusPolicy.js');
const { firstText } = require('./resultText.js');

/** Names only product search modes the shard is actually permitted to serve. */
function searchModes(shard) {
	const modes = [];
	if (shard.textFile || shard.parts?.some(part => part.textFile)) {
		modes.push('text');
	}
	if (shard.semanticEligible && shard.storedVectors) {
		modes.push('semantic-vector-exact');
	}
	if (shard.semanticEligible && shard.indexed) {
		modes.push('semantic-vector-indexed');
	}
	return modes;
}

/** Shapes one storage shard into a learner-safe, language-honest capability record. */
function publicShard(shard = {}) {
	const partial = shard.partial === true;
	const storedVectors = Boolean(
		shard.listName
		&& Number(shard.dimensions || 0) > 0
	) || shard.indexType === 'flat-f32';
	const indexed = shard.vectorEnabled === true;
	const semanticEligible = isEnglishSemanticCorpus(shard);
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
		semanticEligible,
		semanticLanguage: semanticEligible ? 'en' : null,
		indexType: shard.indexType || (indexed ? 'hnsw' : null),
		modes: searchModes({
			...shard,
			storedVectors,
			indexed,
			semanticEligible
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
