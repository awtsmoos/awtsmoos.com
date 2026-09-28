// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deviceRouteSelection.test.cjs
 * @description Guards automatic selection, usable insurance, and explicit unavailable-route testimony.
 * The Awtsmoos lets Awtsmoos.com choose redundancy without troubling the human,
 * while a sick road is named for healing instead of being advertised as warm insurance.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const RouteSelection = require("../deviceRouteSelection.js");

function device(name, routeReference, operationalReady = true) {
	return {
		connected: true,
		displayName: name,
		operationalReady,
		routeReference,
		tunnelId: routeReference,
		tunnelName: name,
		transport: "native"
	};
}

test("B\"H healthy primary is selected while rescue remains ordered insurance", () => {
	const primary = device("Awtsmoos Primary", "tun-primary");
	const rescue = device("Awtsmoos Rescue", "tun-rescue");
	const result = RouteSelection.receipt(
		{ liveNative: [primary, rescue] },
		{ device: primary, reason: "healthy_primary" }
	);
	assert.equal(result.selectedRoute.routeReference, "tun-primary");
	assert.equal(result.insuranceRoutes[0].routeReference, "tun-rescue");
	assert.deepEqual(result.unavailableRoutes, []);
	assert.equal(result.humanChoiceRequired, false);
});

test("B\"H unhealthy primary is reported unavailable rather than mislabeled insurance", () => {
	const primary = device("Awtsmoos Primary", "tun-primary", false);
	const rescue = device("Awtsmoos Rescue", "tun-rescue");
	const result = RouteSelection.receipt(
		{ liveNative: [primary, rescue] },
		{ device: rescue, reason: "rescue_failover" }
	);
	assert.equal(result.selectedRoute.routeReference, "tun-rescue");
	assert.deepEqual(result.insuranceRoutes, []);
	assert.equal(result.unavailableRoutes[0].routeReference, "tun-primary");
	assert.equal(result.humanChoiceRequired, false);
});

test("B\"H only genuinely ambiguous device states require human choice", () => {
	const result = RouteSelection.receipt(
		{ liveNative: [] },
		{ device: null, reason: "ambiguous_primary" }
	);
	assert.equal(result.selectedRoute, null);
	assert.equal(result.humanChoiceRequired, true);
});
