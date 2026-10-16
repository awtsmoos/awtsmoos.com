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
	assert.equal(client.capabilities.commandRun, true);
	assert.equal(client.allowCommands, false); // No unrestricted host shell
	assert.equal(hostedCapabilityProfile().capabilities["fs.read"].state, "virtualized");
	assert.equal(hostedCapabilityProfile().capabilities["command.run"].mode, "vfs-readonly-no-host-shell");
	const readonly = await sendVirtualOs($i, "alice", { action: "commandRun", program: "pwd", cwd: "project" });
	assert.equal(readonly.ok, true);
	assert.equal(readonly.stdout, "project\n");
	const blocked = await sendVirtualOs($i, "alice", { action: "commandRun", program: "sudo", args: ["id"] });
	assert.equal(blocked.ok, false);
	assert.equal(blocked.error, "VIRTUAL_COMMAND_POLICY_DENIED");
});

test("resolver module imports after virtual store restoration", () => {
	const resolver = require("../resolveFsVessel.js");
	assert.equal(typeof resolver.resolveFsVessel, "function");
});
