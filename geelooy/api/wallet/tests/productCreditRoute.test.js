//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditRoute.test.js
 * @description Proves direct debit remains an authenticated explicit Wallet mutation
 * and that browsers cannot mint new paid-action identities through route payloads.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { commerceCreditConsume } = require("../routes/commerceCreditConsume.js");
const { routeTable } = require("../routes/table.js");
const { payload, routeContext } = require("./commerceRouteFixture.js");

test("product-credit consume route rejects GET, missing header, and missing login", async () => {
	const getContext = routeContext({ userId: "route-user", walletAction: true });
	assert.equal(payload(await commerceCreditConsume(getContext)).error, "method_not_allowed");
	assert.equal(getContext.response.statusCode, 405);
	const noHeader = routeContext({ method: "POST", userId: "route-user" });
	assert.equal(payload(await commerceCreditConsume(noHeader)).error, "wallet_action_header_required");
	assert.equal(noHeader.response.statusCode, 403);
	const noLogin = routeContext({ method: "POST", walletAction: true });
	assert.equal(payload(await commerceCreditConsume(noLogin)).error, "login_required");
	assert.equal(noLogin.response.statusCode, 401);
});

test("product-credit route rejects browser-invented paid action identity", async () => {
	const context = routeContext({
		method: "POST",
		userId: "route-user",
		walletAction: true,
		body: { actionId: "imaginary-paid-world", idempotencyKey: "route-credit-key-001" }
	});
	const result = payload(await commerceCreditConsume(context));
	assert.equal(result.error, "unknown_paid_action");
	assert.equal(context.response.statusCode, 404);
});

test("route table publishes the guarded product-credit debit doorway", () => {
	assert.equal(routeTable["commerce/credits/consume"], commerceCreditConsume);
});
