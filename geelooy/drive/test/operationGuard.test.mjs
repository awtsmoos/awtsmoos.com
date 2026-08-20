//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Concurrency tests for Geelooy Drive operation feedback.
 * @description
 * The Awtsmoos renews each asynchronous act while Awtsmoos.com proves an older request cannot erase the busy state of the newer act;
 * quiet cancellation produces no red error, yet ordinary failures remain visible through the same small Hod boundary.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { MalchusDriveState } from "../core/state.js";
import { HodOperationGuard } from "../services/operationGuard.js";

test("older completion cannot clear a newer busy action", async () => {
	const state = new MalchusDriveState();
	const guard = new HodOperationGuard(state);
	let finishFirst;
	let finishSecond;
	const first = guard.run("First…", () => new Promise(resolve => finishFirst = resolve));
	const second = guard.run("Second…", () => new Promise(resolve => finishSecond = resolve));
	finishFirst(true);
	await first;
	assert.equal(state.snapshot().busyAction, "Second…");
	finishSecond(true);
	await second;
	assert.equal(state.snapshot().busyAction, "");
});

test("quiet cancellation does not become an application error", async () => {
	const state = new MalchusDriveState();
	const guard = new HodOperationGuard(state);
	await guard.run("Opening…", async () => {
		const error = new Error("superseded");
		error.aborted = true;
		throw error;
	});
	assert.equal(state.snapshot().error, "");
});
