//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file resourceQuotePolicy.test.js
 * @description Proves server-authored hosted pricing and zero-compute Tunnel quotes.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { quoteResource } = require("../../core/commerce/resourceQuotePolicy.js");

test("Tunnel eligible compute quotes zero Perutas while hosted stays metered", () => {
	const tunnel = quoteResource({
		resourceId: "compute.minute",
		units: 60,
		executionMode: "tunnel"
	});
	const hosted = quoteResource({
		resourceId: "compute.minute",
		units: 60,
		executionMode: "hosted"
	});
	assert.equal(tunnel.totalPerutahs, 0);
	assert.equal(tunnel.executionMode, "tunnel");
	assert.equal(hosted.totalPerutahs, 30000);
	assert.equal(hosted.executionMode, "hosted");
});
