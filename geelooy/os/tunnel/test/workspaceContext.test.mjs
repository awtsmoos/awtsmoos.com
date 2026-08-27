// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Explorer context adoption is explicit, route-exact, and navigation-only.
 * @description
 * The Awtsmoos lets one proven folder become command cwd only through an explicit
 * exact-route act. Awtsmoos.com rejects friendly-name collisions, opens Files inside
 * the living OS when possible, and never turns context adoption into command execution.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	adoptWorkspaceContext,
	findTargetByRoute
} from "../workspaceTargetCommit.js";
import {
	openExplorerPath,
	workspaceExplorerPath
} from "../workspaceContext.js";
import {
	contextTargets,
	makeWorkspaceState,
	makeWorkspaceView
} from "./workspaceContextFixtures.mjs";

if (!globalThis.CustomEvent) {
	globalThis.CustomEvent = class CustomEvent {
		constructor(type, options = {}) {
			this.type = type;
			this.detail = options.detail;
		}
	};
}

test("target lookup matches immutable route rather than friendly name", () => {
	assert.equal(findTargetByRoute(contextTargets, "route-two"), contextTargets[1]);
	assert.equal(findTargetByRoute(contextTargets, "Same Name"), null);
});

test("explicit adoption commits exact route and cwd without a command", () => {
	const state = makeWorkspaceState();
	const view = makeWorkspaceView();
	const result = adoptWorkspaceContext({
		view,
		state,
		targets: contextTargets,
		context: { route: "route-two", cwd: "docs" }
	});
	assert.equal(result.ok, true);
	assert.deepEqual(state.get(), {
		route: "route-two",
		name: "Same Name",
		cwd: "docs"
	});
	assert.equal(view.targetSelect.value, "route-two");
	assert.equal(view.runButton.disabled, true);
	assert.equal(view.panel.events.length, 1);
});

test("mismatched route is refused without changing state", () => {
	const state = makeWorkspaceState();
	const before = state.get();
	const result = adoptWorkspaceContext({
		view: makeWorkspaceView(),
		state,
		targets: contextTargets,
		context: { route: "missing-route", cwd: "private" }
	});
	assert.equal(result.ok, false);
	assert.deepEqual(state.get(), before);
});

test("workspace cwd becomes canonical Explorer network path", () => {
	assert.equal(
		workspaceExplorerPath({ route: "route/one" }, { cwd: "docs/sub" }),
		"/network/route%2Fone/docs/sub"
	);
});

test("live OS reveal opens File Explorer in-process without URL navigation", () => {
	const calls = [];
	let assigned = "";
	const os = {
		addWindow(options) {
			calls.push(options);
			return "window";
		}
	};
	const result = openExplorerPath(os, "/network/route-live/docs", {
		location: { assign(value) { assigned = value; } }
	});
	assert.equal(result, "window");
	assert.equal(calls.length, 1);
	assert.equal(calls[0].programName, "awtsmoosFileExplorer");
	assert.equal(calls[0].path, "/network/route-live/docs");
	assert.equal(assigned, "");
});
