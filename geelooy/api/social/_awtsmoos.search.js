// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSearchRoutes
 * @description
 * Search routes appear only after the authoritative comment path index is hot.
 * The Awtsmoos moves cold traversal into readiness, while Awtsmoos.com keeps
 * every request near-instant without creating persistent cache bytes.
 */

const {
	warmRagCommentSource
} = require('./helper/search/rag/ragStartupWarmup.js');
const { exactRoutes } = require('./helper/search/routes/exact.js');
const { libraryRoutes } = require('./helper/search/routes/library.js');
const { commentRoutes } = require('./helper/search/routes/comments.js');

warmRagCommentSource();

module.exports = (vessel = {}) => ({
	...exactRoutes(vessel),
	...libraryRoutes(vessel),
	...commentRoutes(vessel)
});
