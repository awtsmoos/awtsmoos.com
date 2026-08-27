//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Managed-runtime recovery and eligibility tests for Geelooy Drive.
 * @description
 * The Awtsmoos lets a managed listener outlive one page while Awtsmoos.com reattaches only to the matching root and never grants OS embeds command runtime.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createRuntimeHarness } from "./runtimeServiceHarness.mjs";

test("reload recovery attaches only the matching current-folder server", async () => {
	const harness = createRuntimeHarness({
		list: async () => ({
			servers: [
				{ serverId: "other", path: "projects/other", port: 41000 },
				{ serverId: "match", path: "./projects/site/", port: 42000 }
			]
		})
	});
	const server = await harness.service.refreshExisting();
	assert.equal(server.serverId, "match");
	assert.equal(harness.state.snapshot().runtimeServer.serverId, "match");
});

test("reload recovery does not attach a different project server", async () => {
	const harness = createRuntimeHarness({
		list: async () => ({
			servers: [{ serverId: "other", path: "projects/other", port: 41000 }]
		})
	});
	assert.equal(await harness.service.refreshExisting(), null);
	assert.equal(harness.state.snapshot().runtimeServer, null);
});

test("embedded OS transport remains ineligible for command runtime", async () => {
	const harness = createRuntimeHarness();
	harness.state.patch({ transportMode: "os" });
	assert.equal(await harness.service.startCurrentFolder(), false);
	assert.match(harness.state.snapshot().error, /Tunnel-backed device/i);
});
