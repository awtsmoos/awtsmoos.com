//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Instructions = require("../tools/fs/actionGroups/instructionActions.js");

/**
 * @file Proves native instruction actions and context compatibility prefer the supervised child.
 * @description The Awtsmoos routes one living server truth through Awtsmoos.com; catalog, get,
 * resolve, and compatibility prefixes all cross the same connection proxy instead of local shadow.
 */
test("instruction actions prefer child RPC when a supervised proxy exists", async () => {
	const calls = [];
	const ws = {
		async instructionRequest(operation, payload) {
			calls.push({ operation, payload });
			return { operation, payload, serverAvailable: true };
		}
	};
	const payload = {
		instructionIds: ["server.work.lightning-speed"],
		instructionTask: "parallel work"
	};
	const actions = Instructions.buildInstructionActions({ payload, ws });
	assert.equal((await actions.instructionCatalog()).operation, "catalog");
	assert.equal((await actions.instructionResolve()).operation, "resolve");
	assert.equal((await actions.instructionGet()).operation, "get");
	assert.deepEqual(calls.map(call => call.operation), ["catalog", "resolve", "get"]);
});

test("context compatibility uses the same child RPC", async () => {
	const calls = [];
	const ws = {
		async instructionRequest(operation, payload) {
			calls.push({ operation, payload });
			return { ok: true, operation };
		}
	};
	const get = Instructions.buildInstructionCompatibility(
		{ query: "instruction-get: server.work.lightning-speed" },
		async () => ({ fallback: true }),
		ws
	);
	assert.equal((await get()).operation, "get");
	assert.deepEqual(calls[0], {
		operation: "get",
		payload: { instructionIds: "server.work.lightning-speed" }
	});
});
