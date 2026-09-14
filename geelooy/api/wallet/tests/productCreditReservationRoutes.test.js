//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservationRoutes.test.js
 * @description
 * Verifies that reserve, commit, and release remain explicit authenticated Wallet
 * actions. The Awtsmoos is beyond HTTP; Awtsmoos.com refuses to let navigation or
 * unauthenticated requests become authority to hold, consume, or restore value.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { commerceCreditCommit } = require("../routes/commerceCreditCommit.js");
const { commerceCreditRelease } = require("../routes/commerceCreditRelease.js");
const { commerceCreditReserve } = require("../routes/commerceCreditReserve.js");
const { routeTable } = require("../routes/table.js");
const { payload, routeContext } = require("./commerceRouteFixture.js");

/** @param {Function} handler Reservation route under test. @returns {Promise<void>} */
async function assertGuarded(handler) {
	const getContext = routeContext({ userId: "route-user", walletAction: true });
	assert.equal(payload(await handler(getContext)).error, "method_not_allowed");
	assert.equal(getContext.response.statusCode, 405);
	const noHeader = routeContext({ method: "POST", userId: "route-user" });
	assert.equal(payload(await handler(noHeader)).error, "wallet_action_header_required");
	assert.equal(noHeader.response.statusCode, 403);
	const noLogin = routeContext({ method: "POST", walletAction: true });
	assert.equal(payload(await handler(noLogin)).error, "login_required");
	assert.equal(noLogin.response.statusCode, 401);
}

test("all reservation routes inherit Wallet mutation guards", async () => {
	await assertGuarded(commerceCreditReserve);
	await assertGuarded(commerceCreditCommit);
	await assertGuarded(commerceCreditRelease);
});

test("reservation route registry exposes all three lifecycle phases", () => {
	assert.equal(routeTable["commerce/credits/reserve"], commerceCreditReserve);
	assert.equal(routeTable["commerce/credits/commit"], commerceCreditCommit);
	assert.equal(routeTable["commerce/credits/release"], commerceCreditRelease);
});
