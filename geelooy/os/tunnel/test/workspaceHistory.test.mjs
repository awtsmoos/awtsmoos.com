// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Tunnel Workspace history is bounded, metadata-only, and replay-safe.
 * @description
 * The Awtsmoos lets a command leave one breadcrumb without leaving output, tokens,
 * or hidden testimony behind. Awtsmoos.com permits rerun only after terminal rest;
 * pending sparks may be watched or cancelled, never silently reborn.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	WORKSPACE_HISTORY_LIMIT,
	canRerunHistoryEntry,
	createWorkspaceHistory,
	sanitizeHistoryEntry
} from "../workspaceHistory.js";

function memoryStorage() {
	const values = new Map();
	return {
		getItem(key) { return values.get(key) || null; },
		setItem(key, value) { values.set(key, String(value)); },
		removeItem(key) { values.delete(key); },
		values
	};
}

test("sanitizer persists metadata while dropping output credentials and extras", () => {
	const entry = sanitizeHistoryEntry({
		id: "one",
		command: "pwd",
		cwd: ".",
		route: "route-live",
		displayName: "Mac",
		status: "completed",
		jobId: "job-1",
		stdout: "secret output",
		stderr: "secret error",
		output: "secret",
		token: "bearer-secret"
	});
	assert.equal(entry.command, "pwd");
	for (const key of ["stdout", "stderr", "output", "token"]) {
		assert.equal(key in entry, false);
	}
});

test("history is bounded to the newest twenty metadata receipts", () => {
	const storage = memoryStorage();
	const history = createWorkspaceHistory(storage);
	for (let index = 0; index < WORKSPACE_HISTORY_LIMIT + 5; index += 1) {
		history.record({
			id: `entry-${index}`,
			command: `echo ${index}`,
			route: "route-live",
			status: "completed",
			startedAt: index + 1
		});
	}
	assert.equal(history.list().length, WORKSPACE_HISTORY_LIMIT);
	assert.equal(history.list()[0].id, "entry-24");
	assert.equal(history.list().at(-1).id, "entry-5");
});

test("only terminal receipts are eligible for explicit rerun", () => {
	const base = { command: "pwd", route: "route-live" };
	assert.equal(canRerunHistoryEntry({ ...base, status: "completed" }), true);
	assert.equal(canRerunHistoryEntry({ ...base, status: "failed" }), true);
	assert.equal(canRerunHistoryEntry({ ...base, status: "pending" }), false);
	assert.equal(canRerunHistoryEntry({ ...base, status: "running" }), false);
	assert.equal(canRerunHistoryEntry({ ...base, status: "cancel_requested" }), false);
});

test("persisted JSON contains no attempted secret-bearing output", () => {
	const storage = memoryStorage();
	const history = createWorkspaceHistory(storage);
	history.record({
		id: "safe",
		command: "env",
		route: "route-live",
		status: "completed",
		output: "TOKEN=secret",
		stdout: "TOKEN=secret",
		token: "secret"
	});
	const raw = [...storage.values.values()].join("\n");
	assert.doesNotMatch(raw, /TOKEN=secret|\"token\"|\"stdout\"|\"output\"/);
});
