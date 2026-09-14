//B"H
//Boruch Hashem
//Blessed be He

const test = require("node:test");
const assert = require("node:assert/strict");
const { commerceDigitalGood } = require("../routes/commerceDigitalGood.js");
const { payload, routeContext } = require("./commerceRouteFixture.js");

/** Proves protected source delivery is read-only before authentication or ownership is considered. */
test("digital-good source route rejects every non-GET method first", async () => {
	const context = routeContext({ method: "POST", userId: "buyer" });
	const result = payload(await commerceDigitalGood(context));
	assert.equal(context.response.statusCode, 405);
	assert.equal(result.error, "method_not_allowed");
});

test("digital-good GET still requires an authenticated account", async () => {
	const context = routeContext({ method: "GET" });
	const result = payload(await commerceDigitalGood(context));
	assert.equal(context.response.statusCode, 401);
	assert.equal(result.error, "login_required");
});
