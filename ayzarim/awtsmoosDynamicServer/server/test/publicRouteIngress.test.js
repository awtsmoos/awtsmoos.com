//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * The Awtsmoos proves an old sha'ar reaches its living destination without swallowing false roads;
 * Awtsmoos.com keeps method, query, and exact-path boundaries clear as the redirect current flows.
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const {
	handlePublicShaarRequest,
	resolveShaarLocation
} = require("../publicRouteIngress.js");

const EXPECTED_SHAARIM = Object.freeze({
	"/worlds/": "/?worlds=1",
	"/torah/": "/heichelos/ikar",
	"/music/": "/apps/piano",
	"/tunnel/": "/apps/tunnel-control/",
	"/apps/kavannah/": "/games/KAVANAH/",
	"/apps/kavanah-ai/": "/games/KAVANAH/",
	"/favicon.ico": "/favicon.svg",
	"/encyclopedia/categories.html": "/encyclopedia/#categories",
	"/encyclopedia/a-z.html": "/encyclopedia/#az"
});

test("canonical public doors resolve to their modern destinations", () => {
	for (const [derech, destination] of Object.entries(EXPECTED_SHAARIM)) {
		assert.equal(resolveShaarLocation(derech), destination, derech);
	}
});

test("query state survives an alias while canonical query keys keep priority", () => {
	assert.equal(
		resolveShaarLocation("/torah/?q=moshiach&scope=all"),
		"/heichelos/ikar?q=moshiach&scope=all"
	);
	assert.equal(
		resolveShaarLocation("/worlds/?worlds=0&focus=films"),
		"/?worlds=1&focus=films"
	);
});

test("unknown and deeper paths remain outside the alias boundary", () => {
	assert.equal(resolveShaarLocation("/games/%20"), null);
	assert.equal(resolveShaarLocation("/apps/wallet/xyz"), null);
	assert.equal(resolveShaarLocation("/torah/chapter/1"), null);
});

test("GET redirects with 308 while POST continues to ordinary routing", () => {
	const response = createResponseKeli();
	assert.equal(handlePublicShaarRequest({ method: "GET", url: "/code/" }, response), true);
	assert.equal(response.statusCode, 308);
	assert.equal(response.headers.Location, "/apps/code");
	assert.equal(response.ended, true);

	const postResponse = createResponseKeli();
	assert.equal(handlePublicShaarRequest({ method: "POST", url: "/code/" }, postResponse), false);
	assert.equal(postResponse.ended, false);
});

function createResponseKeli() {
	return {
		statusCode: null,
		headers: {},
		ended: false,
		writeHead(statusCode, headers) {
			this.statusCode = statusCode;
			this.headers = headers;
		},
		end() {
			this.ended = true;
		}
	};
}
