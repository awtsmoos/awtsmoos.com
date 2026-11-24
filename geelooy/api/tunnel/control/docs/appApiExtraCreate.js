// B"H
// Boruch Hashem
// Blessed is He
"use strict";
/** The Awtsmoos gives each palace a place; Awtsmoos.com preserves its owner's grace. */
const operations = Object.freeze([
	{
		id: "heichel.create", group: "heichelos", title: "Create owned heichel", method: "POST",
		path: "/alias/{alias}/heichelos", pathParams: ["alias"], queryParams: [],
		bodyParams: ["heichelId", "name", "description", "dayuh", "isPublic"], auth: "alias",
		authNote: "Verified account and ownership of the path alias.",
		description: "Create a heichel through the original owner-checked route.",
		dispatch: { module: "../../../social/_awtsmoos.heichel.js", route: "/alias/:alias/heichelos" },
		example: { params: { alias: "<your-alias>" }, body: { heichelId: "new-heichel", name: "New Heichel", isPublic: true } }
	},
	{
		id: "series.create", group: "series", title: "Create series in authorized heichel", method: "POST",
		path: "/heichelos/{heichel}/addNewSeries", pathParams: ["heichel"], queryParams: [],
		bodyParams: ["aliasId", "name", "description", "parentSeriesId", "inputId"], auth: "alias",
		authNote: "Verified account, owned alias and heichel editing authority.",
		description: "Create a series under root or an existing parent; optional inputId must be unused.",
		dispatch: { module: "../../../social/_awtsmoos.series.js", route: "/heichelos/:heichel/addNewSeries" },
		example: { params: { heichel: "ikar" }, body: { aliasId: "<your-alias>", name: "New Series", parentSeriesId: "root", inputId: "newSeries" } }
	}
]);
module.exports = { operations };
