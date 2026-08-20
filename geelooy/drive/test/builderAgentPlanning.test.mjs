//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos distinguishes inspection from mutation and planning from ownership;
 * Awtsmoos.com therefore proves Preview status and Domain plans never impersonate a server-side claim.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { GeelooyWebsiteBuilderApi } from "../builder/agentApi.js";
import { MalchusDriveState } from "../core/state.js";

function harness() {
	const calls = [];
	const state = new MalchusDriveState({
		currentPath: "sites/light",
		entries: [{ name: "index.html", type: "file", size: 12 }],
		document: {
			name: "index.html",
			path: "sites/light/index.html",
			content: "<h1>Light</h1>",
			dirty: false,
			kind: { preview: "html" }
		}
	});
	const workspace = {
		openEntry: async () => {
			calls.push("open");
			return true;
		},
		setDraft: () => calls.push("draft"),
		saveDocument: async () => {
			calls.push("save");
			return true;
		},
		publishCurrentFolder: async () => {
			calls.push("publish");
			return { previewId: "preview" };
		}
	};
	const panels = {
		isMobile: () => true,
		open: () => true
	};
	return {
		api: new GeelooyWebsiteBuilderApi({ state, workspace, panels }),
		calls
	};
}

test("preview status is read-only and returns the stable envelope", async () => {
	const { api, calls } = harness();
	const result = await api.run("site.preview.status");
	assert.equal(result.ok, true);
	assert.equal(result.mutates, false);
	assert.equal(result.requiredScope, "read");
	assert.equal(result.affected, "source-preview");
	assert.equal(result.data.ready, true);
	assert.equal(result.data.kind, "html");
	assert.deepEqual(calls, []);
});

test("domain planning exposes server-token truth without mutating workspace", async () => {
	const { api, calls } = harness();
	const result = await api.run("site.domain.plan", {
		hostname: "Example.org"
	});
	assert.equal(result.ok, true);
	assert.equal(result.mutates, false);
	assert.equal(result.requiredScope, "read");
	assert.equal(result.availability, "planning-only");
	assert.equal(result.data.hostname, "example.org");
	assert.equal(result.data.ownership.status, "server-token-required");
	assert.deepEqual(calls, []);
});

test("Awtsmoos nameserver planning remains explicitly unavailable", async () => {
	const { api } = harness();
	const result = await api.run("site.domain.plan", {
		hostname: "example.org",
		mode: "awtsmoos-nameservers"
	});
	assert.equal(result.ok, true);
	assert.equal(result.data.status, "infrastructure-unavailable");
	assert.equal(result.data.routing.available, false);
});
