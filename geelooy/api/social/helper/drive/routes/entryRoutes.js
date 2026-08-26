//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveEntryRoutes
 * @description The Awtsmoos gives each HTTP path a narrow doorway; Awtsmoos.com keeps routing separate from authorization and data work so every API remains visible and testable.
 */

const { safeRoute } = require('./routeSupport.js');
const {
	executeEntries,
	executeEntry,
	executeUsage
} = require('./entryOperations.js');

/**
 * @description Creates the canonical Drive entry, content, metadata, trash, and usage route map.
 * @param {Object} context - Route construction context.
 * @param {Object} context.$i - Active Awtsmoos request interface.
 * @param {string|null} context.userid - Logged-in user identifier when present.
 * @returns {Object<string,Function>} Drive route handlers.
 */
function createEntryRoutes(context) {
	return {
		'/drive/:aliasId/entries': handleEntries.bind(null, context),
		'/drive/:aliasId/entry/:path*': handleEntry.bind(null, context),
		'/drive/:aliasId/usage': handleUsage.bind(null, context)
	};
}

/**
 * @description Wraps listing/creation work in the shared HTTP error boundary.
 * @param {Object} context - Route context containing request interface and user identity.
 * @param {Object} variables - Router variables containing aliasId.
 * @returns {Promise<Object>} Safe HTTP-shaped listing or creation response.
 */
function handleEntries(context, variables) {
	return safeRoute(executeEntries.bind(null, context, variables));
}

/**
 * @description Wraps read/write/metadata/trash work in the shared HTTP error boundary.
 * @param {Object} context - Route context containing request interface and user identity.
 * @param {Object} variables - Router variables containing aliasId and logical path.
 * @returns {Promise<Object>} Safe HTTP-shaped entry response.
 */
function handleEntry(context, variables) {
	return safeRoute(executeEntry.bind(null, context, variables));
}

/**
 * @description Wraps Drive usage retrieval in the shared HTTP error boundary.
 * @param {Object} context - Route context containing request interface and user identity.
 * @param {Object} variables - Router variables containing aliasId.
 * @returns {Promise<Object>} Safe HTTP-shaped usage response.
 */
function handleUsage(context, variables) {
	return safeRoute(executeUsage.bind(null, context, variables));
}

module.exports = createEntryRoutes;
