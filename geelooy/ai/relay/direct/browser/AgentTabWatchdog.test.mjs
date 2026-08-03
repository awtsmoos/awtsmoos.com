// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { AgentTabWatchdog } from "./AgentTabWatchdog.mjs";

test("watchdog starts once, sweeps, reports, and stops", async () => {
	let callback = null;
	let cleared = null;
	let sweeps = 0;
	const timer = { unrefCalled: false, unref() { this.unrefCalled = true; } };
	const watchdog = new AgentTabWatchdog({
		protector: { watchdogSweep: async () => { sweeps += 1; } },
		setInterval: handler => { callback = handler; return timer; },
		clearInterval: value => { cleared = value; },
		intervalMs: 500
	});
	assert.equal(watchdog.start(), true);
	assert.equal(watchdog.start(), false);
	await watchdog.tick();
	callback();
	await Promise.resolve();
	assert.ok(sweeps >= 2);
	assert.equal(timer.unrefCalled, true);
	assert.equal(watchdog.status().running, true);
	assert.equal(watchdog.stop(), true);
	assert.equal(cleared, timer);
});
