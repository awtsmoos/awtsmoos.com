// B"H
// The Awtsmoos preserves appApiLegacyHeichelos.js at the gate of Awtsmoos.com.
"use strict";

module.exports = Object.freeze([
	{
		"id": "heichel.get",
		"group": "heichelos",
		"title": "Get heichel",
		"method": "GET",
		"path": "/heichelos/{heichel}",
		"pathParams": [
			"heichel"
		],
		"queryParams": [],
		"bodyParams": [],
		"auth": "public",
		"authNote": "Public read. No alias needed.",
		"description": "Read one heichel record (id, name, settings, public prateem).",
		"dispatch": {
			"module": "../../../social/_awtsmoos.heichel.js",
			"route": "/heichelos/:heichel"
		},
		"example": {
			"params": {
				"heichel": "ikar"
			}
		}
	},
	{
		"id": "heichel.seriesList",
		"group": "heichelos",
		"title": "List root series of a heichel",
		"method": "GET",
		"path": "/heichelos/{heichel}/series/",
		"pathParams": [
			"heichel"
		],
		"queryParams": [],
		"bodyParams": [],
		"auth": "public",
		"authNote": "Public read. No alias needed.",
		"description": "List the root-level series (children of 'root'), always detailed.",
		"dispatch": {
			"module": "../../../social/_awtsmoos.series.js",
			"route": "/heichelos/:heichel/series/"
		},
		"example": {
			"params": {
				"heichel": "ikar"
			}
		}
	},
	{
		"id": "heichels.byAlias",
		"group": "heichelos",
		"title": "List heichelos owned by an alias",
		"method": "GET",
		"path": "/alias/{alias}/heichelos/details",
		"pathParams": [
			"alias"
		],
		"queryParams": [],
		"bodyParams": [],
		"auth": "public",
		"authNote": "Public read. Lists heichelos the alias owns.",
		"description": "Detailed list of heichelos owned by the given alias id.",
		"dispatch": {
			"module": "../../../social/_awtsmoos.heichel.js",
			"route": "/alias/:alias/heichelos/details"
		},
		"example": {
			"params": {
				"alias": "likkutei"
			}
		}
	}
]);
