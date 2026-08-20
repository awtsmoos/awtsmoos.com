// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Explorer refresh publishes tunnel context only after VFS truth.
 * @description
 * The Awtsmoos lets a requested folder remain a question until the filesystem
 * answers. Awtsmoos.com tests the same refresh function used by the real controller
 * without importing browser-only action modules: success publishes, local success
 * clears, and failure preserves the last proven context.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { refreshExplorerState } from "../api/controllerRefresh.js";
import { ensureTunnelContext } from "../../../tunnel/tunnelContext.js";

function makeHarness() {
	const failures = new Set();
	const events = [];
	const state = {
		currentPath: "/desktop.folder",
		loading: false,
		error: "",
		items: []
	};
	const os = {
		vfs: {
			async list(path) {
				if (failures.has(path)) {
					throw new Error("vfs rejected path");
				}
				return [];
			},
			resolve() {
				return { mount: {} };
			},
			can() {
				return { ok: true };
			}
		}
	};
	return {
		os,
		state,
		failures,
		events: {
			emit(type, detail) {
				events.push({ type, detail });
				return detail;
			}
		},
		seen: events
	};
}

test("successful remote refresh publishes immutable folder context", async () => {
	const harness = makeHarness();
	harness.state.currentPath = "/network/route%2Fone/docs";
	await refreshExplorerState(harness);
	assert.deepEqual(ensureTunnelContext(harness.os).snapshot(), {
		route: "route/one",
		cwd: "docs",
		path: "/network/route%2Fone/docs",
		provider: "tunnel"
	});
	assert.equal(harness.seen.at(-1).type, "explorer.refresh");
});

test("successful local refresh clears prior tunnel context", async () => {
	const harness = makeHarness();
	harness.state.currentPath = "/network/route-live/docs";
	await refreshExplorerState(harness);
	harness.state.currentPath = "/desktop.folder";
	await refreshExplorerState(harness);
	assert.equal(ensureTunnelContext(harness.os).snapshot(), null);
});

test("failed refresh preserves last successfully proven context", async () => {
	const harness = makeHarness();
	harness.state.currentPath = "/network/route-live/docs";
	await refreshExplorerState(harness);
	const before = ensureTunnelContext(harness.os).snapshot();
	harness.state.currentPath = "/network/route-bad/private";
	harness.failures.add(harness.state.currentPath);
	await assert.rejects(
		refreshExplorerState(harness),
		/vfs rejected path/
	);
	assert.deepEqual(ensureTunnelContext(harness.os).snapshot(), before);
	assert.equal(harness.state.error, "vfs rejected path");
	assert.equal(harness.seen.at(-1).type, "explorer.error");
});
