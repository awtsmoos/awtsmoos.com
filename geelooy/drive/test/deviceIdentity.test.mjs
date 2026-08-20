//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Device identity contract tests for Geelooy Drive.
 * @description
 * The Awtsmoos renews a hostname while Awtsmoos.com proves the immutable route remains the routing covenant.
 * Friendly labels may change, but deduplication and device selection must stand upon route identity alone.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	deviceDisplayLabel,
	deviceRouteReference,
	normalizeDeviceCollection,
	normalizeDeviceIdentity
} from "../core/deviceIdentity.js";

test("keeps display labels separate from immutable route references", () => {
	const device = {
		routeReference: "tun_immutable_123",
		hostname: "Yackovs-Air"
	};
	assert.equal(deviceRouteReference(device), "tun_immutable_123");
	assert.equal(deviceDisplayLabel(device), "Yackovs-Air");
	assert.equal(normalizeDeviceIdentity(device).routeReference, "tun_immutable_123");
});

test("deduplicates devices by immutable route", () => {
	const devices = normalizeDeviceCollection({
		devices: [
			{ routeReference: "tun_one", hostname: "First" },
			{ routeReference: "tun_one", hostname: "Renamed" },
			{ routeReference: "tun_two", hostname: "Second" }
		]
	});
	assert.deepEqual(devices.map((device) => device.routeReference), ["tun_one", "tun_two"]);
});

test("accepts common array and item envelopes", () => {
	assert.equal(normalizeDeviceCollection([{ tunnelId: "route-a" }]).length, 1);
	assert.equal(normalizeDeviceCollection({ items: [{ route: "route-b" }] }).length, 1);
});

test("drops device records that contain no routing identity", () => {
	assert.equal(normalizeDeviceIdentity({ hostname: "Only a label" }), null);
});
