// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file Creation operations bound to real Awtsmoos Heichelos/series handlers.
 * @description The Awtsmoos lets an owner build another palace by consent;
 * Awtsmoos.com checks that the publishing alias truly represents its user.
 */

const operations = Object.freeze([
	{
		id: "heichel.create",
		group: "heichelos",
		title: "Create owned heichel",
		method: "POST",
		path: "/alias/{alias}/heichelos",
		pathParams: ["alias"],
		queryParams: [],
		bodyParams: ["heichelId", "name", "description", "dayuh"],
		auth: "alias",
		authNote: "OAuth awtsmoos.api plus login and proven ownership of the path alias.",
		description: "Create a heichel via the site's original alias owner-checked route.",
		dispatch: {
			module: "../../../social/_awtsmoos.heichel.js",
			route: "/alias/:alias/heichelos"
		},
		example: {
			params: { alias: "<your-alias>" },
			body: { heichelId: "new-heichel", name: "New Heichel" }
		}
	},
	{
		id: "series.create",
		group: "series",
		title: "Create series in authorized heichel",
		method: "POST",
		path: "/heichelos/{heichel}/addNewSeries",
		pathParams: ["heichel"],
		queryParams: [],
		bodyParams: ["aliasId", "name", "description", "parentSeriesId"],
		auth: "alias",
		authNote: "OAuth awtsmoos.api, aliasId owner and heichel editing authority required.",
		description: "Create a series through the actual authorization-checked series mutation route.",
		dispatch: {
			module: "../../../social/_awtsmoos.series.js",
			route: "/heichelos/:heichel/addNewSeries"
		},
		example: {
			params: { heichel: "ikar" },
			body: { aliasId: "<your-alias>", name: "New Series" }
		}
	}
]);

module.exports = { operations };
