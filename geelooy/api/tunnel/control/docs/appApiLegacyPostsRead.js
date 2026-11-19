// B"H
// The Awtsmoos preserves appApiLegacyPostsRead.js at the gate of Awtsmoos.com.
"use strict";

module.exports = Object.freeze([
	{
		"id": "posts.list",
		"group": "posts",
		"title": "List posts in a series",
		"method": "GET",
		"path": "/heichelos/{heichel}/series/{series}/posts",
		"pathParams": [
			"heichel",
			"series"
		],
		"queryParams": [],
		"bodyParams": [],
		"auth": "public",
		"authNote": "Public read. No alias needed.",
		"description": "List posts in one series (summary form).",
		"dispatch": {
			"module": "../../../social/_awtsmoos.posts.js",
			"route": "/heichelos/:heichel/series/:series/posts"
		},
		"example": {
			"params": {
				"heichel": "ikar",
				"series": "likkutei-sichos"
			}
		}
	},
	{
		"id": "posts.listDetails",
		"group": "posts",
		"title": "List posts with details",
		"method": "GET",
		"path": "/heichelos/{heichel}/series/{series}/posts/details",
		"pathParams": [
			"heichel",
			"series"
		],
		"queryParams": [],
		"bodyParams": [],
		"auth": "public",
		"authNote": "Public read. No alias needed.",
		"description": "List posts in one series with full details.",
		"dispatch": {
			"module": "../../../social/_awtsmoos.posts.js",
			"route": "/heichelos/:heichel/series/:series/posts/details"
		},
		"example": {
			"params": {
				"heichel": "ikar",
				"series": "likkutei-sichos"
			}
		}
	},
	{
		"id": "posts.get",
		"group": "posts",
		"title": "Get one post",
		"method": "GET",
		"path": "/heichelos/{heichel}/series/{series}/post/{post}",
		"pathParams": [
			"heichel",
			"series",
			"post"
		],
		"queryParams": [],
		"bodyParams": [],
		"auth": "public",
		"authNote": "Public read. No alias needed.",
		"description": "Read one post (title, content, dayuh enrichment when present).",
		"dispatch": {
			"module": "../../../social/_awtsmoos.posts.js",
			"route": "/heichelos/:heichel/series/:series/post/:post"
		},
		"example": {
			"params": {
				"heichel": "ikar",
				"series": "likkutei-sichos",
				"post": "<post-id>"
			}
		}
	}
]);
