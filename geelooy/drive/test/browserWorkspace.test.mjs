//B"H
//Boruch Hashem
//Blessed be He

import test from "node:test";
import assert from "node:assert/strict";
import { canMutateWorkspace } from "../core/accessState.js";
import {
	BROWSER_WORKSPACE_ROUTE,
	YesodBrowserWorkspace
} from "../transport/browserWorkspace.js";
import {
	createWorkspaceTransport,
	shouldUseBrowserWorkspace,
	shouldUseTunnelWorkspace
} from "../transport/transportFactory.js";

/** Proves viral remix mode has a real writable zero-install transport without weakening Tunnel mode. */
function repository() {
	const nodes = new Map();
	return {
		async list() {
			return [...nodes.values()];
		},
		async read(path) {
			return nodes.get(path)?.content || "";
		},
		async write(path, content) {
			nodes.set(path, { name: path.split("/").at(-1), type: "file", content, size: content.length });
			return { ok: true };
		},
		async mkdir(path) {
			nodes.set(path, { name: path.split("/").at(-1), type: "directory", size: 0 });
			return { ok: true };
		}
	};
}

test("remix and explicit local URLs select browser workspace", () => {
	assert.equal(shouldUseBrowserWorkspace({ search: "?remix=%2Fsites%2Falpha%2F" }), true);
	assert.equal(shouldUseBrowserWorkspace({ search: "?local=1" }), true);
	assert.equal(shouldUseBrowserWorkspace({ search: "?path=demo" }), false);
});

test("browser workspace is writable, private, and not falsely cloud-publishable", async () => {
	const transport = new YesodBrowserWorkspace({ repository: repository() });
	const [device] = await transport.discoverDevices();
	assert.equal(device.routeReference, BROWSER_WORKSPACE_ROUTE);
	assert.equal(device.capabilities.fsWrite, true);
	assert.equal(transport.describe().mode, "browser");
	assert.equal(transport.describe().canPublish, false);
	assert.equal(canMutateWorkspace({ transportMode: "browser" }), true);
	await transport.mkdir(BROWSER_WORKSPACE_ROUTE, "demo");
	await transport.write(BROWSER_WORKSPACE_ROUTE, "index.html", "<h1>B\"H</h1>");
	assert.equal(await transport.read(BROWSER_WORKSPACE_ROUTE, "index.html"), "<h1>B\"H</h1>");
	await assert.rejects(() => transport.publishFolder(), error => error.code === "BROWSER_WORKSPACE_PUBLISH_REQUIRES_CLOUD");
});

test("browser workspace rejects cross-transport route identities", async () => {
	const transport = new YesodBrowserWorkspace({ repository: repository() });
	await assert.rejects(() => transport.write("other-device", "x.txt", "x"), error => error.code === "BROWSER_WORKSPACE_ROUTE_INVALID");
});


test("plain Builder defaults to zero-install Browser Workspace while Tunnel stays explicit", () => {
	const browserWindow = { location: { search: "", href: "https://awtsmoos.com/drive/" } };
	const chosen = createWorkspaceTransport({
		browserWindow,
		context: { embedded: false },
		indexedDb: {}
	});
	assert.equal(chosen.descriptor.mode, "browser");
	assert.equal(shouldUseTunnelWorkspace({ search: "?tunnel=1" }), true);
	assert.equal(shouldUseTunnelWorkspace({ search: "?route=awt-device-1" }), true);
	assert.equal(shouldUseTunnelWorkspace({ search: "?route=cloud%3Aalpha" }), false);
});
