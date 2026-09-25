// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { AgentTabWatchdog } from "./AgentTabWatchdog.mjs";
import { DeviceBrowserPortResolver } from "./DeviceBrowserPortResolver.mjs";

/**
 * @file Proves the watchdog backs off and breaks the launch circuit on failure.
 * @description
 * A dead browser with a deferred relaunch must never become a tight retry
 * storm: sweeps back off exponentially and launch attempts stop entirely for
 * the cooldown window. Fake clocks keep every timing assertion deterministic.
 */
function launchFailure(code = "debug_chrome_launch_deferred_resource_pressure") {
	const error = new Error(code);
	error.code = code;
	return error;
}

function makeWatchdog({ sweeper, resolver, overrides = {} }) {
	let now = 1000;
	const watchdog = new AgentTabWatchdog({
		protector: { catalog: { portResolver: resolver || null }, watchdogSweep: sweeper },
		setInterval: () => ({ unref() {} }),
		clearInterval: () => {},
		now: () => now,
		baseBackoffMs: 1000,
		maxBackoffMs: 8000,
		launchFailureThreshold: 3,
		circuitCooldownMs: 60000,
		...overrides
	});
	return { watchdog, advance: ms => { now += ms; }, clock: () => now };
}

function makeResolver({ now, launchFailureThreshold = 10 } = {}) {
	let starts = 0;
	const resolver = new DeviceBrowserPortResolver({
		registry: { observe: async () => ({ ok: false, status: "device_ai_browser_offline" }) },
		browserStarter: async () => {
			starts += 1;
			throw launchFailure();
		},
		fetcher: async () => { throw new Error("connection refused"); },
		now,
		launchFailureThreshold,
		launchCooldownMs: 60000,
		probeTimeoutMs: 250
	});
	return { resolver, starts: () => starts };
}

test("repeated launch failures back off exponentially instead of retrying tightly", async () => {
	let sweeps = 0;
	const { watchdog, advance } = makeWatchdog({
		sweeper: async () => { sweeps += 1; throw launchFailure(); }
	});
	assert.equal(await watchdog.tick(), false);
	assert.equal(sweeps, 1);
	assert.equal(watchdog.status().consecutiveFailures, 1);
	// Immediate next tick is skipped by the backoff: no sweep, no storm.
	assert.equal(await watchdog.tick(), false);
	assert.equal(sweeps, 1);
	// After the base backoff elapses the sweep runs again.
	advance(1000);
	assert.equal(await watchdog.tick(), false);
	assert.equal(sweeps, 2);
	// Second consecutive failure doubles the backoff to 2000ms.
	advance(1000);
	assert.equal(await watchdog.tick(), false);
	assert.equal(sweeps, 2);
	advance(1000);
	assert.equal(await watchdog.tick(), false);
	assert.equal(sweeps, 3);
});

test("launch-failure streak opens the circuit and suppresses launches for the cooldown", async () => {
	let now = 1000;
	const clock = () => now;
	const { resolver, starts } = makeResolver({ now: clock });
	const watchdog = new AgentTabWatchdog({
		protector: {
			catalog: { portResolver: resolver },
			watchdogSweep: async () => { await resolver.findPort(); }
		},
		setInterval: () => ({ unref() {} }),
		clearInterval: () => {},
		now: clock,
		baseBackoffMs: 1000,
		maxBackoffMs: 8000,
		launchFailureThreshold: 3,
		circuitCooldownMs: 60000
	});
	// Drive ticks forward through their backoff windows.
	for (let i = 0; i < 60 && starts() < 3; i++) {
		await watchdog.tick();
		now += 500;
	}
	assert.equal(starts(), 3);
	const status = watchdog.status();
	assert.equal(status.consecutiveLaunchFailures, 3);
	assert.ok(status.circuitOpenUntil > clock());
	assert.equal(resolver.status().launchSuppressedUntil, status.circuitOpenUntil);
	// Sweeps continue at backoff cadence but no launch is attempted during cooldown.
	for (let i = 0; i < 60; i++) {
		await watchdog.tick();
		now += 500;
	}
	assert.equal(starts(), 3);
});

test("a later success resets backoff, streaks, and the launch circuit", async () => {
	let fail = true;
	const suppressed = { until: null, cleared: false };
	const { watchdog, advance } = makeWatchdog({
		sweeper: async () => { if (fail) throw launchFailure(); },
		resolver: {
			suppressLaunches: until => { suppressed.until = until; },
			clearLaunchSuppression: () => { suppressed.cleared = true; }
		}
	});
	for (let i = 0; i < 3; i++) {
		await watchdog.tick();
		advance(9000);
	}
	assert.ok(suppressed.until !== null);
	fail = false;
	advance(9000);
	assert.equal(await watchdog.tick(), true);
	const status = watchdog.status();
	assert.equal(status.consecutiveFailures, 0);
	assert.equal(status.consecutiveLaunchFailures, 0);
	assert.equal(status.circuitOpenUntil, null);
	assert.equal(suppressed.cleared, true);
});

test("non-launch failures back off without opening the launch circuit", async () => {
	const suppressed = { until: null };
	const { watchdog, advance } = makeWatchdog({
		sweeper: async () => { throw new Error("tab_close_probe_timeout"); },
		resolver: { suppressLaunches: until => { suppressed.until = until; } }
	});
	for (let i = 0; i < 6; i++) {
		await watchdog.tick();
		advance(9000);
	}
	assert.equal(watchdog.status().consecutiveLaunchFailures, 0);
	assert.equal(watchdog.status().circuitOpenUntil, null);
	assert.equal(suppressed.until, null);
});

test("device_ai_browser_unavailable is classified as a launch failure", async () => {
	const { watchdog, advance } = makeWatchdog({
		sweeper: async () => { throw launchFailure("device_ai_browser_unavailable"); }
	});
	await watchdog.tick();
	advance(9000);
	await watchdog.tick();
	assert.equal(watchdog.status().consecutiveLaunchFailures, 2);
});
