//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Managed-runtime lifecycle tests for Geelooy Drive.
 * @description
 * The Awtsmoos lets a server listen while Awtsmoos.com proves start, expose, and stop remain bound to the immutable route that created it.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	createRuntimeHarness,
	runtimeDevice
} from "./runtimeServiceHarness.mjs";

test("start records the source route and immediately reads managed logs", async () => {
	const harness = createRuntimeHarness();
	await harness.service.startCurrentFolder();
	const snapshot = harness.state.snapshot();
	assert.equal(snapshot.runtimeRoute, "tun-one");
	assert.equal(snapshot.runtimeServer.serverId, "server-1");
	assert.equal(snapshot.runtimeLogs.length, 1);
	assert.deepEqual(harness.calls.slice(0, 2), [
		["start", "tun-one", "projects/site"],
		["logs", "tun-one", "server-1", 80]
	]);
});

test("stop remains bound to the original route after visible device changes", async () => {
	const harness = createRuntimeHarness();
	await harness.service.startCurrentFolder();
	harness.state.patch({
		currentRoute: "tun-two",
		devices: [runtimeDevice("tun-one"), runtimeDevice("tun-two")]
	});
	await harness.service.stop();
	assert.deepEqual(harness.calls.at(-1), ["stop", "tun-one", "server-1"]);
	assert.equal(harness.state.snapshot().runtimeServer, null);
});

test("public exposure uses the recorded route and stores verification", async () => {
	const harness = createRuntimeHarness();
	await harness.service.startCurrentFolder();
	await harness.service.exposePublic();
	assert.equal(harness.calls.at(-1)[0], "expose");
	assert.equal(harness.calls.at(-1)[1], "tun-one");
	assert.equal(harness.state.snapshot().runtimeExposure.publicVerified, true);
});
