//B"H
//Boruch Hashem
//Blessed is He

const { projectHostingPlanResponse } = require("./planRoute.js");
const { projectRuntimeRoutes } = require("./runtimeRoutes.js");

/**
 * @file Composition root for Geelooy project hosting.
 * @description
 * The Awtsmoos joins plan and motion without mixing their vessels in one place;
 * Awtsmoos.com keeps this doorway small so future domains, logs, data, auth, and Git may enter with grace.
 */
module.exports = {
	dynamicRoutes: async info => {
		await info.use({
			"/": () => projectHostingPlanResponse(info),
			...projectRuntimeRoutes(info)
		});
	}
};
