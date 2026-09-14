//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const ReadyState = require("./debugChromeReadyState.cjs");

/**
 * @file Guards the exact PID handoff into post-cleanup DevTools verification.
 * @description
 * A dynamic port alone is insufficient identity. The final discovery call must
 * receive the registered browser owner after purge and keeper reconciliation.
 */
test("post-cleanup discovery receives the registered browser PID", async () => {
	let observed = null;
	const runtime = {
		debugPort: () => 62144,
		purge: async () => ({ ok: true, closed: 0 }),
		keeper: async () => ({ ok: true }),
		authority: () => ({
			ok: true,
			port: 62144,
			pid: 18236,
			host: "127.0.0.1",
			incarnationId: "inc-2",
			generation: 2
		}),
		findBrowser: async options => {
			observed = options;
			return { ok: true };
		}
	};
	const result = await ReadyState.prepare({}, { ok: true, debugPort: 62144 }, runtime);
	assert.equal(result.ok, true);
	assert.equal(observed.preferredPort, 62144);
	assert.equal(observed.expectedPid, 18236);
	assert.equal(observed.incarnationId, "inc-2");
});

test("authority loss stops before post-cleanup discovery", async () => {
	let discoveryCalls = 0;
	const runtime = {
		debugPort: () => 62144,
		purge: async () => ({ ok: true, closed: 0 }),
		keeper: async () => ({ ok: true }),
		authority: () => ({ ok: false }),
		findBrowser: async () => {
			discoveryCalls += 1;
			return { ok: true };
		}
	};
	const result = await ReadyState.prepare({}, { ok: true, debugPort: 62144 }, runtime);
	assert.equal(result.ok, false);
	assert.equal(result.status, "device_browser_authority_lost");
	assert.equal(discoveryCalls, 0);
});
