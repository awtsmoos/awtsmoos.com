// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSearchRoutes
 * @chapter Every Search Family Receives The Same Immutable Request Snapshot
 * @description
 * Exact words, comments, library text, and persisted vectors share one frozen
 * request vessel while retaining the live interface only for database services.
 */

const { exactRoutes } = require('./helper/search/routes/exact.js');
const { libraryRoutes } = require('./helper/search/routes/library.js');
const { commentRoutes } = require('./helper/search/routes/comments.js');

module.exports = (vessel = {}) => ({
	...exactRoutes(vessel),
	...libraryRoutes(vessel),
	...commentRoutes(vessel)
});
