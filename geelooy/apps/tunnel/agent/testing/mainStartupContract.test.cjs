// B"H
const assert = require('node:assert/strict');
const { createStartupRuntime } = require('../lib/runtime/main-startup.js');

/** B"H — Startup calls only real APIs and returns receipts for every subsystem. */
(async () => {
	const config = {
		tunnelName: 'awt-startup-test',
		root: '/project',
		deviceStateRoot: '/state',
		localApiPort: 4567
	};
	const calls = {};
	const runtime = createStartupRuntime({
		loadConfig: () => config,
		log: () => {},
		AGENT_VERSION: 'test-version',
		Limits: {
			MAX_INFLIGHT: 4,
			MAX_QUEUE: 40,
			LANE_LIMITS: { p0_control: 1 }
		},
		inlineLimit: 1000,
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
		connection: { connect() { calls.connected = true; return { opened: true }; } },
		openHostedControl(received) { calls.opened = received; return true; },
		shouldOpenControl: () => true
	});
	const result = await runtime.main();
	assert.equal(result.ok, true);
	assert.equal(result.tunnelName, config.tunnelName);
	assert.equal(result.localApiStarted, true);
	assert.equal(result.bootResumeEnabled, true);
	assert.equal(result.updateScheduled, true);
	assert.equal(result.socketStarted, true);
	assert.equal(result.openedControl, true);
	assert.deepEqual(calls.cleanup, {
		projectRoot: '/project',
		stateRoot: '/state',
		dryRun: false
	});
	assert.equal(calls.localApi.configLoader(), config);
	assert.equal(calls.update.config, config);
	assert.equal(calls.connected, true);
	assert.equal(calls.opened, config);
	console.log(JSON.stringify({ ok: true, suite: 'main-startup-contract' }, null, 2));
})().catch(error => {
	console.error(error);
	process.exit(1);
});
