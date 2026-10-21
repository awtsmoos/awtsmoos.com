//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module pendingCommentVectors
 * @description
 * Barrel for pendingCommentVectors: re-exports the identical surface from its sibling modules.
 */

const { EMBED_CONCURRENCY, VECTOR_DIMENSIONS, storePathFor } = require('./pendingCommentVectorsCore.js');
const { noteImportedComments, searchPendingVectors } = require('./pendingCommentVectorsApi.js');
const { drainPendingVectors, mergePendingHits, pendingIndexStats } = require('./pendingCommentVectorsMerge.js');

module.exports = {
	EMBED_CONCURRENCY,
	VECTOR_DIMENSIONS,
	drainPendingVectors,
	mergePendingHits,
	noteImportedComments,
	pendingIndexStats,
	searchPendingVectors,
	storePathFor
};
