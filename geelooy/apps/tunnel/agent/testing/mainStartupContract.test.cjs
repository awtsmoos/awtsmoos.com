// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createStartupRuntime } = require("../lib/runtime/main-startup.js");

/** Proves API and relay start before delegated owning history maintenance. */
(async () => {
	const config = {
		tunnelName: "awt-startup-test",
		root: "/project",
		deviceStateRoot: "/state",
		localApiPort: 4567
	};
	const order = [];
	const calls = {};
	const runtime = createStartupRuntime({
		config: { ROOT: "/install" },
		loadConfig: () => config,
		log: () => {},
		AGENT_VERSION: "test-version",
		Limits: { MAX_INFLIGHT: 4, MAX_QUEUE: 40, LANE_LIMITS: { p0_control: 1 } },
		inlineLimit: 1000,
		ProjectRootHealth: {
			probeProjectRoot(received, installRoot) {
				calls.rootProbe = { received, installRoot };
				return { ok: true, state: "ready", root: received.root };
			}
		},
		spawnHistoryCleanup(installRoot, received) {
			order.push("cleanup");
			calls.cleanup = { installRoot, received };
			return { pid: 4242, unref() {} };
		},
		startLocalApiServer(options) {
			order.push("localApi");
			calls.localApi = options;
			return { listening: true };
		},
		Boot: { start(log) { calls.bootLog = log; return { enabled: true }; } },
		WebsiteMissionRecovery: {
			recover(received) { calls.websiteMissionRecovery = received; return ["one"]; }
		},
		Updates: { scheduleSelfUpdate(options) { calls.update = options; return {}; } },
		DeviceIdentity: {
			load() { return { ok: true, deviceId: "dev_test" }; },
			publicStatus() { return { ok: true, deviceId: "dev_test" }; }
		},
		FsExecutor: { warm() { calls.warming = true; return { minimumWorkers: 4 }; } },
		connection: {
			connect() { order.push("connection"); calls.connected = true; return {}; }
		},
		openHostedControl(received) { calls.opened = received; return true; },
		shouldOpenControl: () => true
	});
	const result = await runtime.main();
	assert.equal(result.ok, true);
	assert.equal(result.cleanup.pid, 4242);
	assert.deepEqual(order, ["localApi", "connection", "cleanup"]);
	assert.deepEqual(calls.rootProbe, { received: config, installRoot: "/install" });
	assert.deepEqual(calls.cleanup, { installRoot: "/install", received: config });
	assert.equal(calls.localApi.configLoader(), config);
	assert.equal(calls.update.config, config);
	assert.equal(calls.connected, true);
	assert.equal(calls.websiteMissionRecovery, config);
	assert.equal(calls.warming, true);
	assert.equal(calls.opened, config);
	console.log(JSON.stringify({
		ok: true,
		suite: "main-startup-contract",
		startupOrder: order
	}, null, 2));
})().catch((error) => {
	console.error(error);
	process.exit(1);
});
