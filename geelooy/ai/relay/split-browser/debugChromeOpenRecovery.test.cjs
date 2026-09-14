//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const Recovery = require("./debugChromeOpenRecovery.cjs");

/**
 * @file Proves hung-owner recovery defers under pressure and replaces only when safe.
 * @description
 * Runtime dependencies are pure fakes; no browser process is touched by this suite.
 */
function quietConfig() {
	return {
		debugPort: 9223,
		pressureOptions: {
			processText: "",
			maxChromeCpu: 1000,
			maxRootCount: 100,
			maxLoadRatio: 1000
		}
	};
}

test("resource pressure preserves a reused hung owner", async () => {
	let closed = 0;
	let launched = 0;
	const result = await Recovery.recover({
		config: {
			debugPort: 9223,
			pressureOptions: {
				processText: "999 Google Chrome Helper --type=gpu-process",
				maxChromeCpu: 100,
				maxRootCount: 100,
				maxLoadRatio: 1000
			}
		},
		first: { ok: false },
		firstLaunch: { reused: true, pid: 77, debugPort: 9223 },
		port: 9223,
		runtime: {
			closeStale: async () => { closed += 1; return { closed: 1 }; },
			launch: async () => { launched += 1; return { debugPort: 9223 }; },
			wait: async () => ({ ok: true }),
			sleep: async () => {}
		},
		prepareReady: async () => ({ ok: true })
	});
	assert.equal(result.status, "debug_chrome_recovery_deferred_resource_pressure");
	assert.equal(closed, 0);
	assert.equal(launched, 0);
});
test("quiet host replaces one exact hung owner", async () => {
	let closed = 0;
	let launched = 0;
	const runtime = {
		closeStale: async (port, options) => {
			closed += 1;
			assert.equal(port, 9223);
			assert.equal(options.pid, 77);
			return { closed: 1 };
		},
		launch: async () => {
			launched += 1;
			return { debugPort: 9223, reused: false };
		},
		wait: async () => ({ ok: true, debugPort: 9223 }),
		sleep: async () => {}
	};
	const result = await Recovery.recover({
		config: quietConfig(),
		first: { ok: false },
		firstLaunch: { reused: true, pid: 77, debugPort: 9223 },
		port: 9223,
		runtime,
		prepareReady: async () => ({ ok: true, status: "debug_chrome_ready" })
	});
	assert.equal(result.ok, true);
	assert.equal(result.recoveryAttempted, true);
	assert.equal(closed, 1);
	assert.equal(launched, 1);
});
