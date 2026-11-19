// B"H
// The Awtsmoos preserves appApiLegacySeries.js at the gate of Awtsmoos.com.
"use strict";

module.exports = Object.freeze([
	{
		"id": "series.get",
		"group": "series",
		"title": "Get series",
		"method": "GET",
		"path": "/heichelos/{heichel}/series/{series}",
		"pathParams": [
			"heichel",
			"series"
		],
		"queryParams": [
			"details"
		],
		"bodyParams": [],
		"auth": "public",
		"authNote": "Public read. Pass details=true for the full detailed record.",
		"description": "Read one series. Without ?details=true returns the fast packed-DB prateem read; with details=true returns the full detailed record.",
		"dispatch": {
			"module": "../../../social/_awtsmoos.series.js",
			"route": "/heichelos/:heichel/series/:series"
		},
		"example": {
			"params": {
				"heichel": "ikar",
				"series": "likkutei-sichos"
			},
			"query": {
				"details": "true"
			}
		}
	},
	{
		"id": "series.getDetails",
		"group": "series",
		"title": "Get series details",
		"method": "GET",
		"path": "/heichelos/{heichel}/series/{series}/details",
		"pathParams": [
			"heichel",
			"series"
		],
		"queryParams": [],
		"bodyParams": [],
		"auth": "public",
		"authNote": "Public read. No alias needed.",
		"description": "Read the full detailed record of one series.",
		"dispatch": {
			"module": "../../../social/_awtsmoos.series.js",
			"route": "/heichelos/:heichel/series/:series/details"
		},
		"example": {
			"params": {
				"heichel": "ikar",
				"series": "likkutei-sichos"
			}
		}
	},
	{
		"id": "series.subSeries",
		"group": "series",
		"title": "List sub-series",
		"method": "GET",
		"path": "/heichelos/{heichel}/series/{series}/subSeries",
		"pathParams": [
			"heichel",
			"series"
		],
		"queryParams": [
			"details"
		],
		"bodyParams": [],
		"auth": "public",
		"authNote": "Public read. No alias needed.",
		"description": "List child series of one series; detailed when ?details=true.",
		"dispatch": {
			"module": "../../../social/_awtsmoos.series.js",
			"route": "/heichelos/:heichel/series/:series/subSeries"
		},
		"example": {
			"params": {
				"heichel": "ikar",
				"series": "likkutei-sichos"
			}
		}
	}
]);
