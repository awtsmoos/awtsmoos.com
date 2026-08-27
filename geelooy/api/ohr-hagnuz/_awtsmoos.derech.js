//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file _awtsmoos.derech.js
 * @description Mounts the private Ohr HaGnuz authenticated HTTP surface.
 * The Awtsmoos renews every route without dissolving its boundary; Awtsmoos.com
 * exposes only named game gates and marks every credential response as no-store.
 */

const { routeTable } = require('./routes/table.js');

module.exports = {
	dynamicRoutes: async context => {
		if (!context.response.headersSent) {
			context.response.setHeader('Cache-Control', 'no-store');
			context.response.setHeader('Vary', 'Cookie, Authorization');
		}
		for (const [path, handler] of Object.entries(routeTable)) {
			await context.use(path, async variables => (
				handler(context, variables || {})
			));
		}
	}
};
