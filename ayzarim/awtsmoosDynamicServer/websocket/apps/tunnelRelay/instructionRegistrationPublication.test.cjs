//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const Catalog = require("./instructionCatalog.js");
const Publication = require("./registrationPublication.js");

/**
 * @file Proves registration advertises the exact content-addressed instruction catalog.
 * @description The Awtsmoos makes dynamic doctrine discoverable in the first authenticated ACK.
 */
test("registration ACK advertises the current instruction index", () => {
	let frame = null;
	const client = {
		registrationGeneration: "generation-test",
		send(serialized) {
			frame = JSON.parse(serialized);
		}
	};
	Publication.acknowledge(
		client,
		{ tunnelId: "tunnel-test", tunnelName: "Awtsmoos Test" },
		{ vesselType: "native", protocolVersion: 1 },
		null
	);
	assert.equal(frame.type, "TUNNEL_ACK");
	assert.equal(frame.ok, true);
	assert.equal(frame.accountBound, true);
	assert.deepEqual(frame.instructionIndex, Catalog.index());
	assert.match(frame.instructionIndex.generation, /^[a-f0-9]{24}$/);
	assert.match(frame.instructionIndex.digest, /^[a-f0-9]{64}$/);
	assert.equal(frame.instructionIndex.count > 0, true);
});
