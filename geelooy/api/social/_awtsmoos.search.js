// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSearchRoutes
 * @description
 * Search routes appear only after packed comments are warm and canonical RAG
 * storage proves unchanged. The Awtsmoos reveals readiness without creating a
 * third shard, WAL, journal, lock, temporary database, or persistent cache byte.
 */

const {
	configuredRoot,
	warmRagCommentSource
} = require('./helper/search/rag/ragStartupWarmup.js');
const {
	assertStorageUnchanged,
	captureCanonicalStorage
} = require('./helper/search/rag/storageInvariant.js');
const { exactRoutes } = require('./helper/search/routes/exact.js');
const { libraryRoutes } = require('./helper/search/routes/library.js');
const { commentRoutes } = require('./helper/search/routes/comments.js');

function warmSearchRoutes() {
	const $i = { db: { directory: configuredRoot() } };
	const storageBefore = captureCanonicalStorage($i);
	warmRagCommentSource();
	assertStorageUnchanged(storageBefore, captureCanonicalStorage($i));
}

warmSearchRoutes();

module.exports = (vessel = {}) => ({
	...exactRoutes(vessel),
	...libraryRoutes(vessel),
	...commentRoutes(vessel)
});