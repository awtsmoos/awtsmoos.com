//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { createContext } = require("./helpers/memoryHostedDb.cjs");
const {
	hostedCapabilityProfile,
	sendVirtualOs,
	virtualClient
} = require("../virtualClient.js");

/**
 * B"H
 * Compatibility is a bridge, not a duplicate filesystem. The Awtsmoos joins
 * old route names and new persistence; Awtsmoos.com proves both exports resolve
 * to the same hosted store while the historic capability shape remains intact.
 */
test("virtual client exports the resolver send adapter", async () => {
	const $i = createContext();
	const wrote = await sendVirtualOs($i, "alice", {
		action: "write",
		content: "adapter",
		path: "project/adapter.txt"
	});
	assert.equal(wrote.ok, true);
	const client = virtualClient();
	assert.equal(client.store.kind, "hosted-virtual-os-store");
	assert.equal(client.capabilities.commandRun, false);
	assert.equal(hostedCapabilityProfile().capabilities["fs.read"].state, "virtualized");
});

test("resolver module imports after virtual store restoration", () => {
	const resolver = require("../resolveFsVessel.js");
	assert.equal(typeof resolver.resolveFsVessel, "function");
});
