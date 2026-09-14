//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionExecutionRoute.test.js
 * @description
 * Proves the complete premium-action gateway inherits Wallet mutation guards and
 * server error status semantics. The Awtsmoos is beyond HTTP; Awtsmoos.com keeps
 * navigation, unauthenticated callers, and unknown actions outside fulfillment.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { commerceActionExecute } = require("../routes/commerceActionExecute.js");
const { routeTable } = require("../routes/table.js");
const { payload, routeContext } = require("./commerceRouteFixture.js");

test("paid-action execution route inherits Wallet mutation guards", async () => {
	const getContext = routeContext({ userId: "route-user", walletAction: true });
	assert.equal(payload(await commerceActionExecute(getContext)).error, "method_not_allowed");
	assert.equal(getContext.response.statusCode, 405);
	const noHeader = routeContext({ method: "POST", userId: "route-user" });
	assert.equal(payload(await commerceActionExecute(noHeader)).error, "wallet_action_header_required");
	assert.equal(noHeader.response.statusCode, 403);
	const noLogin = routeContext({ method: "POST", walletAction: true });
	assert.equal(payload(await commerceActionExecute(noLogin)).error, "login_required");
	assert.equal(noLogin.response.statusCode, 401);
});

test("paid-action route registry exposes the complete execution gateway", () => {
	assert.equal(routeTable["commerce/actions/execute"], commerceActionExecute);
});

test("unknown paid action fails closed before fulfillment", async () => {
	const context = routeContext({
		method: "POST",
		userId: "route-user",
		walletAction: true,
		body: {
			actionId: "unknown.action",
			idempotencyKey: "route-action-001"
		}
	});
	const result = payload(await commerceActionExecute(context));
	assert.equal(result.error, "unknown_paid_action");
	assert.equal(context.response.statusCode, 404);
});
