//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { canMutateWorkspace } from "../core/accessState.js";
import {
	CLOUD_WORKSPACE_PREFIX,
	YesodCloudWorkspace
} from "../transport/cloudWorkspace.js";
import { shouldUseCloudWorkspace } from "../transport/transportFactory.js";

/** Proves owned aliases become truthful Builder cloud devices without Tunnel authority. */
function client() {
	return {
		aliases: async () => ["alpha"],
		list: async () => [{ path: "site/index.html", type: "file", size: 12, visibility: "private" }],
		read: async () => "<h1>B\"H</h1>",
		write: async () => ({ entry: { path: "site/index.html" } }),
		mkdir: async () => ({ entry: { path: "site" } })
	};
}

test("explicit cloud mode and cloud routes select cloud workspace", () => {
	assert.equal(shouldUseCloudWorkspace({ search: "?cloud=1" }), true);
	assert.equal(shouldUseCloudWorkspace({ search: "?route=cloud%3Aalpha" }), true);
	assert.equal(shouldUseCloudWorkspace({ search: "?local=1" }), false);
});

test("owned alias becomes writable private cloud workspace", async () => {
	const transport = new YesodCloudWorkspace({ client: client() });
	const [device] = await transport.discoverDevices();
	assert.equal(device.routeReference, `${CLOUD_WORKSPACE_PREFIX}alpha`);
	assert.equal(device.platform, "Awtsmoos Cloud");
	assert.equal(device.capabilities.fsWrite, true);
	assert.equal(transport.describe().mode, "cloud");
	assert.equal(transport.describe().canPublish, false);
	assert.equal(canMutateWorkspace({ transportMode: "cloud" }), true);
	const [entry] = await transport.list(device.routeReference, "site");
	assert.equal(entry.name, "index.html");
	assert.equal(entry.type, "file");
	assert.equal(entry.raw.visibility, "private");
	assert.equal(await transport.read(device.routeReference, "site/index.html"), "<h1>B\"H</h1>");
});

test("cloud workspace refuses non-cloud route identities and temporary preview publishing", async () => {
	const transport = new YesodCloudWorkspace({ client: client() });
	assert.throws(
		() => transport.write("browser-local", "x.txt", "x"),
		error => error.code === "CLOUD_WORKSPACE_ROUTE_INVALID"
	);
	await assert.rejects(
		() => transport.publishFolder(),
		error => error.code === "CLOUD_WORKSPACE_USE_IMMUTABLE_PUBLISH"
	);
});
