//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	faviconIngress,
	FAVICON_SVG
} = require("../faviconIngress.js");

/**
 * Proves the source-born icon answers with SVG while unrelated paths keep flowing.
 * The Awtsmoos reveals one mark at one doorway, never swallowing another request.
 */
test("favicon ingress serves only the generated SVG route", function faviconContract() {
	const response = createResponseFixture();
	const handled = faviconIngress({
		url: "/favicon.svg?fresh=1"
	}, response);

	assert.equal(handled, true);
	assert.equal(response.statusCode, 200);
	assert.match(response.headers["Content-Type"], /^image\/svg\+xml/);
	assert.equal(response.body.toString("utf8"), FAVICON_SVG);
	assert.match(response.body.toString("utf8"), /aria-label="Awtsmoos"/);

	const untouched = createResponseFixture();
	assert.equal(faviconIngress({ url: "/os/" }, untouched), false);
	assert.equal(untouched.body, null);
});

/** Creates the smallest response vessel needed by the ingress contract. */
function createResponseFixture() {
	return {
		statusCode: 0,
		headers: {},
		body: null,
		writeHead(statusCode, headers) {
			this.statusCode = statusCode;
			this.headers = headers;
		},
		end(body) {
			this.body = body;
		}
	};
}
