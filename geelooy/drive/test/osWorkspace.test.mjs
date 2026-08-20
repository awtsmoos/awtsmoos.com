//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded OS workspace transport tests.
 * @description
 * The Awtsmoos joins child and parent while Awtsmoos.com proves Drive sends only typed VFS requests through the assigned channel.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { YesodOsWorkspace } from "../transport/osWorkspace.js";

function harness() {
	const calls = [];
	const endpoint = {
		sendEvent: (...args) => calls.push(["event", ...args]),
		request: async (type, payload) => {
			calls.push(["request", type, payload]);
			if (type === "drive.vfs.list") return { items: [{ name: "site", type: "folder" }] };
			if (type === "drive.vfs.read") return { content: "B\"H" };
			return { success: true };
		},
		stop: () => calls.push(["stop"])
	};
	let configuration;
	const workspace = new YesodOsWorkspace(
		{ channelId: "chan", parentOrigin: "https://awtsmoos.com" },
		{
			browserWindow: { parent: { id: "parent" } },
			endpointFactory: options => {
				configuration = options;
				return endpoint;
			}
		}
	);
	return { workspace, calls, configuration: () => configuration };
}

test("creates a secured parent endpoint and synthetic OS device", async () => {
	const testHarness = harness();
	assert.equal(testHarness.configuration().channelId, "chan");
	assert.equal(testHarness.configuration().targetOrigin, "https://awtsmoos.com");
	const [device] = await testHarness.workspace.discoverDevices();
	assert.equal(device.routeReference, "awtsmoos-os-vfs");
	assert.equal(device.capabilities.fsWrite, true);
	assert.equal(testHarness.workspace.describe().canPublish, false);
});

test("maps list read write and mkdir to allowlisted bridge requests", async () => {
	const testHarness = harness();
	assert.equal((await testHarness.workspace.list("ignored", "/work"))[0].name, "site");
	assert.equal(await testHarness.workspace.read("ignored", "/work/a.js"), "B\"H");
	await testHarness.workspace.write("ignored", "/work/a.js", "new");
	await testHarness.workspace.mkdir("ignored", "/work/new");
	assert.deepEqual(
		testHarness.calls.filter(call => call[0] === "request").map(call => call[1]),
		["drive.vfs.list", "drive.vfs.read", "drive.vfs.write", "drive.vfs.mkdir"]
	);
});

test("destroy stops the endpoint", () => {
	const testHarness = harness();
	testHarness.workspace.destroy();
	assert.deepEqual(testHarness.calls.at(-1), ["stop"]);
});
