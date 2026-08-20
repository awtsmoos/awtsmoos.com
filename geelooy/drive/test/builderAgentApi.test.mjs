//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves agents receive bounded machine power through the same workspace and panel services. */

import test from "node:test";
import assert from "node:assert/strict";
import { GeelooyWebsiteBuilderApi, installWebsiteBuilderApi } from "../builder/agentApi.js";
import { MalchusDriveState } from "../core/state.js";

function harness() {
	const state = new MalchusDriveState({
		currentPath: "sites/light",
		entries: [{ name: "index.html", type: "file", size: 12 }],
		document: { name: "index.html", path: "sites/light/index.html", content: "<h1>Light</h1>", dirty: false, kind: { preview: "html" } }
	});
	const calls = [];
	const workspace = {
		openEntry: async entry => (calls.push(["open", entry.name]), true),
		setDraft: content => calls.push(["draft", content]),
		saveDocument: async () => (calls.push(["save"]), true),
		createFile: async name => (calls.push(["create", name]), true),
		publishCurrentFolder: async options => ({ previewId: "safe", ...options })
	};
	const panels = { isMobile: () => true, open: id => (calls.push(["panel", id]), true) };
	return { api: new GeelooyWebsiteBuilderApi({ state, workspace, panels }), state, calls };
}

test("capabilities are descriptive and secret free", () => {
	const { api } = harness();
	const actions = api.capabilities();
	assert.equal(actions.some(action => action.name === "site.project.createStarter" && action.mutates), true);
	assert.equal(actions.every(action => "requiredScope" in action && "affected" in action && "availabilityReason" in action), true);
	assert.equal(JSON.stringify(actions).match(/cookie|ssh|private.?key/i), null);
});

test("browser installation publishes the stable API and readiness event", () => {
	const { api } = harness();
	const events = [];
	const browserWindow = { dispatchEvent: event => events.push(event.type) };
	assert.equal(installWebsiteBuilderApi(api, browserWindow), api);
	assert.equal(browserWindow.GeelooySiteBuilder, api);
	assert.deepEqual(events, ["geelooy-site-builder-ready"]);
});

test("collect is bounded and navigation uses the real panel service", async () => {
	const { api, calls } = harness();
	const collected = await api.run("site.project.collect");
	assert.equal(collected.ok, true);
	assert.equal(collected.action, "site.project.collect");
	assert.equal(JSON.stringify(collected).includes("<h1>Light</h1>"), false);
	const opened = await api.run("site.domain.open");
	assert.equal(opened.ok, true);
	assert.deepEqual(calls.at(-1), ["panel", "domain"]);
});

test("oversize source is rejected instead of silently truncated", async () => {
	const { api } = harness();
	const result = await api.run("site.code.updateCurrent", { content: "x".repeat(1000001), save: true });
	assert.equal(result.ok, false);
	assert.equal(result.error, "SOURCE_TOO_LARGE");
	assert.equal(result.requiredScope, "write");
});
