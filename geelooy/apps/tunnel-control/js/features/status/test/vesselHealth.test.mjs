// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves health projection stays narrow and presentation stays truthful.
 * @description
 * The Awtsmoos lets heartbeat and execution testimony reach the human while
 * Awtsmoos.com refuses mailbox, worker, root, tool, and secret internals. The
 * classifier must distinguish a breathing transport from a healthy executor.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeDeviceHealth } from "../../vessels/deviceHealth.js";
import {
	heartbeatAge,
	vesselHealth
} from "../../vessels/vesselHealth.js";
import { vesselPresentation } from "../vesselPresentation.js";

test("health projection keeps bounded health and drops internal machinery", () => {
	const health = sanitizeDeviceHealth({
		heartbeatAt: 1000,
		livenessState: "alive",
		executionHealthSupported: true,
		executionHealthy: true,
		executionHealthFresh: true,
		mailbox: { secret: true },
		workers: [{ pid: 1 }],
		roots: ["/secret"],
		tools: { shell: true }
	});
	assert.equal(health.executionHealthy, true);
	assert.equal("mailbox" in health, false);
	assert.equal("workers" in health, false);
	assert.equal("roots" in health, false);
	assert.equal("tools" in health, false);
});

test("execution-unhealthy transport is degraded rather than green", () => {
	const model = vesselHealth({
		connected: true,
		isAlive: true,
		health: {
			executionHealthSupported: true,
			executionHealthy: false,
			executionHealthFresh: true
		}
	});
	assert.equal(model.state, "degraded");
	assert.match(model.label, /execution degraded/);
});

test("healthy execution and probing remain distinct states", () => {
	assert.equal(vesselHealth({
		connected: true,
		isAlive: true,
		health: {
			executionHealthSupported: true,
			executionHealthy: true,
			executionHealthFresh: true
		}
	}).state, "healthy");
	assert.equal(vesselHealth({
		connected: true,
		isAlive: true,
		health: { probing: true }
	}).state, "probing");
});

test("heartbeat age is display-only and deterministic", () => {
	assert.equal(heartbeatAge({ heartbeatAt: 1000 }, 31000), "Heartbeat 30s ago");
});

test("readable native vessel gets immutable Open in OS handoff", () => {
	const model = vesselPresentation({
		vesselType: "native-tunnel",
		connected: true,
		isAlive: true,
		routeReference: "route/with space",
		tunnelName: "Friendly",
		deviceName: "Mac",
		capabilities: { fsRead: true },
		health: {}
	});
	assert.equal(model.launches[0].label, "Open in OS");
	assert.match(model.launches[0].href, /openExplorer=/);
	assert.match(decodeURIComponent(model.launches[0].href), /\/network\/route%2Fwith%20space|\/network\/route\/with space/);
});

test("Code browser keeps Open Code and also receives file handoff", () => {
	const model = vesselPresentation({
		vesselType: "browser-tab",
		connected: true,
		isAlive: true,
		routeReference: "browser-route",
		tunnelName: "awt-code",
		deviceName: "Awtsmoos Code",
		capabilities: { fsRead: true },
		health: {}
	});
	assert.deepEqual(model.launches.map(item => item.label), ["Open Code", "Open in OS"]);
});
