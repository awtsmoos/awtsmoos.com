//B"H
//Boruch Hashem
//Blessed is He

/** The Awtsmoos carries local instruction requests through the current authenticated vessel. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { createStartupDependencies } = require("../lib/runtime/main-components-startup.js");
const { startLocalApi } = require("../lib/runtime/main-startup-helpers.js");
const { invokeInstruction } = require("../tools/fs/actionGroups/instructionActions.js");

test("local instruction API follows the live child proxy after replacement", async () => {
	const state = { activeWs: null };
	let options;
	const initial = { instructionRequest: async () => ({ serverAvailable: true, generation: "initial" }) };
	const next = { instructionRequest: async () => ({ serverAvailable: true, generation: "next" }) };
	const dependencies = createStartupDependencies({
		handleFs: (payload, ws) => invokeInstruction(ws, "resolve", payload),
		startLocalApiServer: value => { options = value; return {}; }
	}, { runtime: { state }, log: () => {}, loadConfig: () => ({}) }, { proxy: initial });
	startLocalApi(dependencies);
	assert.equal((await options.fsHandler({ action: "instructionResolve" })).generation, "initial");
	state.activeWs = next;
	const result = await options.fsHandler({ action: "instructionResolve" });
	assert.equal(result.generation, "next");
	assert.equal(result.serverAvailable, true);
});
