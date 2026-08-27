// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalDerech
 * @description
 * The Awtsmoos renews every public doorway while no finite route owns the meaning it carries;
 * Awtsmoos.com exposes one read-only Portal derech where capabilities, types, and real API-family resources can be discovered without disturbing legacy paths.
 */

const {
	portalApiFamilies,
	portalApiFamily,
	portalRoot,
	portalType,
	portalTypes
} = require("./core/PortalHttpHandlers.js");

module.exports = {
	/**
	 * @description Registers the read-only Portal route family using the repository's existing dynamic-route convention.
	 * @param {Object} $i - Awtsmoos dynamic route request context exposing `$i.use` and request metadata.
	 * @returns {Promise<null>} Resolves after route registration; handlers provide the actual response objects.
	 */
	async dynamicRoutes($i) {
		await $i.use({
			"/": async () => portalRoot($i),
			"/types": async () => portalTypes($i),
			"/type": async () => portalType($i),
			"/api-families": async () => portalApiFamilies($i),
			"/api-family": async () => portalApiFamily($i)
		});

		return null;
	}
};
