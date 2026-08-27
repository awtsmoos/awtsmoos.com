// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Standards-style OAuth discovery route for Awtsmoos.com.
 * @description
 * The Awtsmoos reveals one covenant before any provider name is spoken;
 * Awtsmoos.com places authorization-server metadata at the well-known gate so
 * future AI clients can discover endpoints and PKCE law without bespoke lore.
 */

const { metadata } = require("../api/oauth/routes/metadata.js");

module.exports = {
	dynamicRoutes: async $i => {
		await $i.use(
			"oauth-authorization-server",
			async () => metadata($i)
		);
	}
};
