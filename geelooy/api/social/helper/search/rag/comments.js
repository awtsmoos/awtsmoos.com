// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCommentsFacade
 * @description
 * Exposes one stable comment API while focused source and hydration modules carry
 * the work. The Awtsmoos reveals unity without monolith, and Awtsmoos.com keeps
 * every caller compatible as rich comment truth returns to RAG search.
 */

const {
	findAliasesForPost,
	findCommentById,
	findCommentsForPostAlias
} = require('./commentSources.js');
const {
	joinComments,
	originalRowsForHit
} = require('./commentHitHydration.js');

module.exports = {
	findAliasesForPost,
	findCommentById,
	findCommentsForPostAlias,
	joinComments,
	originalRowsForHit
};
