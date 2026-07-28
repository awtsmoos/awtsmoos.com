// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createStartupRuntime } = require("../lib/runtime/main-startup.js");

/**
 * @file Proves startup emits receipts for root, identity, API, update, and socket.
 * @description
 * The Awtsmoos renews every subsystem without letting a stub conceal a missing gate.
 * Awtsmoos.com checks the workspace before cleanup, preserves device identity, then
 * opens local and relay vessels only through explicit tested dependencies.
 */
(async () => {
	const config = {
		tunnelName: "awt-startup-test",
		root: "/project",
		deviceStateRoot: "/state",
		localApiPort: 4567
	};
	const calls = {};
	const runtime = createStartupRuntime({
		config: { ROOT: "/install" },
		loadConfig: () => config,
		log: () => {},
		AGENT_VERSION: "test-version",
		Limits: {
			MAX_INFLIGHT: 4,
			MAX_QUEUE: 40,
			LANE_LIMITS: { p0_control: 1 }
		},
		inlineLimit: 1000,
		ProjectRootHealth: {
			probeProjectRoot(received, installRoot) {
				calls.rootProbe = { received, installRoot };
				return { ok: true, state: "ready", root: received.root };
			}
		},
		HistoryCleanup: {
			cleanupAwtsmoosState(options) {
				calls.cleanup = options;
				return { ok: true, summary: { removed: 0 } };
			}
		},
		startLocalApiServer(options) {
			calls.localApi = options;
			return { listening: true };
		},
		Boot: { start(log) { calls.bootLog = log; return { enabled: true }; } },
		Updates: {
			scheduleSelfUpdate(options) {
				calls.update = options;
				return { scheduled: true };
			}
		},
		DeviceIdentity: {
			load() { return { ok: true, deviceId: "dev_test" }; },
			publicStatus() { return { ok: true, deviceId: "dev_test" }; }
		},
		FsExecutor: {
			warm() {
				calls.filesystemExecutorWarming = true;
				return { minimumWorkers: 6, ready: 0 };
			}
		},
		connection: { connect() { calls.connected = true; return { opened: true }; } },
		openHostedControl(received) { calls.opened = received; return true; },
		shouldOpenControl: () => true
	});
	const result = await runtime.main();
	assert.equal(result.ok, true);
	assert.equal(result.projectRootHealth.ok, true);
	assert.equal(result.deviceIdentity.deviceId, "dev_test");
	assert.equal(result.localApiStarted, true);
	assert.equal(result.bootResumeEnabled, true);
	assert.equal(result.updateScheduled, true);
	assert.equal(result.filesystemExecutor.minimumWorkers, 6);
	assert.equal(result.socketStarted, true);
	assert.equal(result.openedControl, true);
	assert.deepEqual(calls.rootProbe, { received: config, installRoot: "/install" });
	assert.deepEqual(calls.cleanup, {
		projectRoot: "/project",
		stateRoot: "/state",
		dryRun: false
	});
	assert.equal(calls.localApi.configLoader(), config);
	assert.equal(calls.update.config, config);
	assert.equal(calls.connected, true);
	assert.equal(calls.filesystemExecutorWarming, true);
	assert.equal(calls.opened, config);
	console.log(JSON.stringify({
		ok: true,
		suite: "main-startup-contract",
		rootReadinessBeforeStartup: true,
		deviceIdentityPreserved: true
	}, null, 2));
})().catch((error) => {
	console.error(error);
	process.exit(1);
});
