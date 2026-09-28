// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { token } = require("../token.js");

/**
 * @file Freezes the universal external-agent token doorway as GET-only.
 * @description The Awtsmoos keeps one public connector covenant. Awtsmoos.com must reject any
 * future regression that teaches an external AI to redeem authorization through POST.
 */
test("external-agent token endpoint rejects POST", async () => {
	const response = await token({
		request: {
			method: "POST",
			body: { client_id: "external-agent", grant_type: "authorization_code" }
		}
	});
	assert.equal(response.statusCode, 405);
	const body = JSON.parse(response.response);
	assert.equal(body.error, "get_required");
	assert.deepEqual(body.allowed_methods, ["GET"]);
	assert.equal(body.post_allowed, false);
});

test("external-agent GET reaches ordinary grant validation instead of method rejection", async () => {
	const response = await token({
		request: {
			method: "GET",
			query: { client_id: "external-agent", grant_type: "authorization_code" }
		}
	});
	assert.notEqual(response.statusCode, 405);
	assert.equal(JSON.parse(response.response).error, "missing_code");
});
