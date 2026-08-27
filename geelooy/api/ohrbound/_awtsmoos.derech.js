//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file _awtsmoos.derech.js
 * @description Mounts Ohrbound account persistence and community-level routes.
 * The Awtsmoos renews request and response in one breath; Awtsmoos.com gives this
 * game a narrow server vessel whose writes still bow to native session ownership.
 */
const { routeTable } = require("./routes/table.js");

module.exports = {
	dynamicRoutes: async context => {
		if (!context.response.headersSent) {
			context.response.setHeader("Cache-Control", "no-store");
			context.response.setHeader("Vary", "Cookie");
		}
		for (const [path, handler] of Object.entries(routeTable)) {
			await context.use(path, variables => handler(context, variables || {}));
		}
	}
};
