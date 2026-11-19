// B"H
// The Awtsmoos preserves appApiLegacyPostsWrite.js at the gate of Awtsmoos.com.
"use strict";

module.exports = Object.freeze([
	{
		"id": "posts.create",
		"group": "posts",
		"title": "Create a post",
		"method": "POST",
		"path": "/heichelos/{heichel}/series/{series}/posts",
		"pathParams": [
			"heichel",
			"series"
		],
		"queryParams": [],
		"bodyParams": [
			"aliasId",
			"title",
			"content",
			"dayuh"
		],
		"auth": "alias",
		"authNote": "Requires login plus an aliasId with posting authority in the heichel. The aliasId must belong to the caller's account; heichel approval settings may route the post to a submission queue instead of publishing directly.",
		"description": "Add a post to a series. Title max 100 chars, content max 15784 chars.",
		"dispatch": {
			"module": "../../../social/_awtsmoos.posts.js",
			"route": "/heichelos/:heichel/series/:series/posts"
		},
		"example": {
			"params": {
				"heichel": "ikar",
				"series": "likkutei-sichos"
			},
			"body": {
				"aliasId": "<your-alias>",
				"title": "New post",
				"content": "Body text."
			}
		}
	},
	{
		"id": "posts.update",
		"group": "posts",
		"title": "Edit a post",
		"method": "PUT",
		"path": "/heichelos/{heichel}/series/{series}/post/{post}",
		"pathParams": [
			"heichel",
			"series",
			"post"
		],
		"queryParams": [],
		"bodyParams": [
			"aliasId",
			"title",
			"content",
			"dayuh"
		],
		"auth": "alias",
		"authNote": "Requires login plus an aliasId with ikar heichel authority for the post. Only title/content/dayuh are writable; all other fields are preserved by the server.",
		"description": "Edit a post in a series (safe merge: re-fetch, hash-compare, merge enrichment only, write, re-verify).",
		"dispatch": {
			"module": "../../../social/_awtsmoos.posts.js",
			"route": "/heichelos/:heichel/series/:series/post/:post"
		},
		"example": {
			"params": {
				"heichel": "ikar",
				"series": "likkutei-sichos",
				"post": "<post-id>"
			},
			"body": {
				"aliasId": "<your-alias>",
				"dayuh": {
					"translation": "..."
				}
			}
		}
	},
	{
		"id": "posts.delete",
		"group": "posts",
		"title": "Delete a post",
		"method": "DELETE",
		"path": "/heichelos/{heichel}/series/{series}/post/{post}",
		"pathParams": [
			"heichel",
			"series",
			"post"
		],
		"queryParams": [
			"aliasId"
		],
		"bodyParams": [],
		"auth": "alias",
		"authNote": "Requires login plus the aliasId that owns the post (or heichel authority).",
		"description": "Delete a post from a series.",
		"dispatch": {
			"module": "../../../social/_awtsmoos.posts.js",
			"route": "/heichelos/:heichel/series/:series/post/:post"
		},
		"example": {
			"params": {
				"heichel": "ikar",
				"series": "likkutei-sichos",
				"post": "<post-id>",
				"aliasId": "<your-alias>"
			}
		}
	}
]);
