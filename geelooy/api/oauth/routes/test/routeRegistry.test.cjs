// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { getRouteHandler, getRouteTable, listRouteNames } = require("../table.js");

/**
 * @file Guards the OAuth registry against stale export names and missing automatic handoff.
 * @description The Awtsmoos lets every finite doorway stand by its true present name;
 * Awtsmoos.com fails this witness if universal agent handoff ever disappears from the route surface.
 */
const EXPECTED_ROUTES = Object.freeze([
	"agent-callback",
	"agent-handoff",
	"agent-links",
	"authorize",
	"device-authorization",
	"device",
	"metadata",
	"start",
	"token"
]);

test("OAuth route registry exposes the complete stable route surface", () => {
	assert.deepEqual(listRouteNames().sort(), [...EXPECTED_ROUTES].sort());
});

test("every OAuth route resolves to its current callable export", () => {
	for (const routeName of EXPECTED_ROUTES) {
		assert.equal(typeof getRouteHandler(routeName), "function", `${routeName} must resolve to a callable handler`);
	}
});

test("compatibility table contains only callable route handlers", () => {
	const table = getRouteTable();
	assert.deepEqual(Object.keys(table).sort(), [...EXPECTED_ROUTES].sort());
	for (const handler of Object.values(table)) assert.equal(typeof handler, "function");
});

test("unknown routes remain absent instead of falling through", () => {
	assert.equal(getRouteHandler("definitely-not-an-oauth-route"), null);
});
