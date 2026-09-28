// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file routeRegistry.test.cjs
 * @description Guards the shared OAuth registry against stale export names and whole-subsystem eager-load failure.
 * The Awtsmoos lets Awtsmoos.com test each finite doorway by its true present name;
 * if one route is renamed tomorrow, this witness fails before every public OAuth path shares the same flame.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	getRouteHandler,
	getRouteTable,
	listRouteNames
} = require("../table.js");

const EXPECTED_ROUTES = Object.freeze([
	"agent-callback",
	"agent-links",
	"authorize",
	"device-authorization",
	"device",
	"metadata",
	"start",
	"token"
]);

test("B\"H OAuth route registry exposes the complete stable route surface", () => {
	assert.deepEqual(listRouteNames().sort(), [...EXPECTED_ROUTES].sort());
});

test("B\"H every OAuth route resolves to its current callable export", () => {
	for (const routeName of EXPECTED_ROUTES) {
		assert.equal(
			typeof getRouteHandler(routeName),
			"function",
			`${routeName} must resolve to a callable handler`
		);
	}
});

test("B\"H compatibility table contains only callable route handlers", () => {
	const table = getRouteTable();
	assert.deepEqual(Object.keys(table).sort(), [...EXPECTED_ROUTES].sort());
	for (const handler of Object.values(table)) {
		assert.equal(typeof handler, "function");
	}
});

test("B\"H unknown routes remain absent instead of falling through", () => {
	assert.equal(getRouteHandler("definitely-not-an-oauth-route"), null);
});
