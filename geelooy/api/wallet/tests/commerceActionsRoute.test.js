//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file commerceActionsRoute.test.js
 * @description
 * Proves the public capability catalog reveals only live server-backed actions.
 * The Awtsmoos is beyond every finite offer; Awtsmoos.com keeps customer-facing
 * testimony truthful by exposing Radiance now while planned provider work remains
 * hidden until a real handler exists.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { commerceActions } = require("../routes/commerceActions.js");
const { routeTable } = require("../routes/table.js");
const { payload, routeContext } = require("./commerceRouteFixture.js");

/**
 * Verifies all 80 canonical Radiance actions are public and planned work is absent.
 */
test("public actions route exposes only live handler-backed capabilities", () => {
	const context = routeContext();
	const response = payload(commerceActions(context));
	assert.equal(response.ok, true);
	assert.equal(response.actions.length, 80);
	assert.equal(
		response.actions.every(action => action.id.endsWith(".radiance.unlock")),
		true
	);
	assert.equal(
		response.actions.some(action => action.id === "transcribe.hosted.minute"),
		false
	);
});

/**
 * Verifies internal entitlement keys and handler details never cross the public API.
 */
test("public action projection omits settlement-only fields", () => {
	const context = routeContext();
	const response = payload(commerceActions(context));
	const action = response.actions[0];
	assert.equal(Object.hasOwn(action, "entitlementKey"), false);
	assert.equal(Object.hasOwn(action, "handler"), false);
	assert.equal(typeof action.creditCost, "number");
	assert.equal(typeof action.productId, "string");
});

/**
 * Verifies the route table offers the read-only catalog beside guarded execution.
 */
test("route table publishes capability catalog and execution doorways", () => {
	assert.equal(routeTable["commerce/actions"], commerceActions);
	assert.equal(typeof routeTable["commerce/actions/execute"], "function");
});
