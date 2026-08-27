//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mutation service tests for Geelooy Drive.
 * @description
 * The Awtsmoos renews every attempted write while Awtsmoos.com proves failure cannot dress itself as success.
 * Invalid child names stop before transport, and remote rejection leaves the state honest for the next action.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { MalchusDriveState } from "../core/state.js";
import { HodOperationGuard } from "../services/operationGuard.js";
import { GevurahWorkspaceMutations } from "../services/workspaceMutations.js";

function createHarness(transportOverrides = {}) {
	const calls = [];
	const transport = {
		write: async (...args) => {
			calls.push(["write", ...args]);
			return { ok: true };
		},
		mkdir: async (...args) => {
			calls.push(["mkdir", ...args]);
			return { ok: true };
		},
		read: async () => "content",
		...transportOverrides
	};
	const state = new MalchusDriveState({ currentRoute: "tun_test", currentPath: "projects" });
	const guard = new HodOperationGuard(state);
	return {
		calls,
		state,
		mutations: new GevurahWorkspaceMutations(state, transport, guard)
	};
}

test("invalid child names never reach the transport", async () => {
	const harness = createHarness();
	assert.equal(await harness.mutations.createFile("../escape"), false);
	assert.equal(harness.calls.length, 0);
	assert.match(harness.state.snapshot().error, /unsafe/i);
});

test("successful creation returns a normalized entry after remote truth", async () => {
	const harness = createHarness();
	const created = await harness.mutations.createFile("index.html");
	assert.equal(created.path, "projects/index.html");
	assert.deepEqual(harness.calls[0], ["write", "tun_test", "projects/index.html", ""]);
});

test("remote creation failure returns false and exposes the error", async () => {
	const harness = createHarness({
		write: async () => {
			throw new Error("device rejected write");
		}
	});
	assert.equal(await harness.mutations.createFile("index.html"), false);
	assert.match(harness.state.snapshot().error, /device rejected write/i);
});
