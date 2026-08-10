// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { buildConfigActions, handleConfigSet } = require("../tools/fs/actionGroups/configActions.js");
const { assertPersistentRootImmutable } = require("../tools/fs/actionGroups/configRootPolicy.js");

/**
 * @file Proves remote control cannot move the persisted tunnel root or advertise rootSelect.
 * @description
 * The Awtsmoos lets each request walk through many vessels while the enduring ground stays still;
 * Awtsmoos.com keeps root immutable, so browsing can never become a reconnecting destructive will.
 */
(async () => {
	provePolicyRejectsRoot();
	proveRuntimeDoesNotAdvertiseRootSelect();
	await proveConfigSetRejectsBeforeRegistration();
	console.log(JSON.stringify({ ok: true, suite: "root-immutability-gate" }));
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

function provePolicyRejectsRoot() {
	assert.equal(assertPersistentRootImmutable({ tunnelName: "stable" }), true);
	assert.throws(
		() => assertPersistentRootImmutable({ root: "/tmp/forbidden" }),
		error => error.code === "persistent_root_mutation_disabled"
	);
}

function proveRuntimeDoesNotAdvertiseRootSelect() {
	const actions = buildConfigActions({
		config: minimalConfig(),
		payload: { action: "configGet" },
		ws: null,
		version: "test"
	});
	assert.equal(Object.prototype.hasOwnProperty.call(actions, "rootSelect"), false);
	assert.equal(typeof actions.roots, "function");
	assert.equal(typeof actions.rootBrowse, "function");
}

async function proveConfigSetRejectsBeforeRegistration() {
	let sendCalls = 0;
	const ws = {
		opened: true,
		sendJson() {
			sendCalls += 1;
		}
	};
	await assert.rejects(
		() => handleConfigSet({ root: "/tmp/forbidden" }, ws, "test"),
		error => error.code === "persistent_root_mutation_disabled"
	);
	assert.equal(sendCalls, 0);
}

function minimalConfig() {
	return {
		tunnelName: "stable",
		relay: "wss://example.invalid",
		local: "http://127.0.0.1",
		root: "/stable/root",
		allowWrite: false,
		allowSecrets: false,
		allowCommands: false,
		enableLocalHttpProxy: false,
		aiAgents: {},
		gitHygiene: {},
		tools: {},
		command: {},
		chrome: {}
	};
}
