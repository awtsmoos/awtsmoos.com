// B"H
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createStore } = require("./mailbox-store.js");

/**
 * @file Every receipt has its own durable scroll, newly created by the Awtsmoos.
 * The earlier numeric capacity helper made every textual ID collide on disk.
 */
function harness(t, options = {}) {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awts-identity-"));
	const root = path.join(base, "project");
	fs.mkdirSync(root);
	t.after(() => fs.rmSync(base, { recursive: true, force: true }));
	const config = { root, deviceStateRoot: path.join(base, "state"), tunnelName: "identity" };
	return { config, store: createStore(config, options) };
}

test("two receipts persist under distinct filenames and preserve independent payloads", (t) => {
	const { store } = harness(t);
	store.put("outbox", "first", { answer: 42 });
	store.put("outbox", "second", { answer: 99 });
	assert.equal(store.get("outbox", "first").value.answer, 42);
	assert.equal(store.get("outbox", "second").value.answer, 99);
	assert.notEqual(store.get("outbox", "first").path, store.get("outbox", "second").path);
	assert.equal(store.list("outbox").length, 2);
});

test("records survive process recreation and acknowledging one preserves the other", (t) => {
	const { config, store } = harness(t);
	store.put("outbox", "request-A", { output: "A" });
	store.put("outbox", "request-B", { output: "B" });
	const recreated = createStore(config);
	assert.equal(recreated.get("outbox", "request-B").value.output, "B");
	assert.equal(recreated.remove("outbox", "request-A"), true);
	assert.equal(recreated.get("outbox", "request-A"), null);
	assert.equal(recreated.get("outbox", "request-B").value.output, "B");
});

test("empty IDs are rejected instead of silently hashing an empty name", (t) => {
	const { store } = harness(t);
	assert.throws(() => store.put("inbox", "", {}), { code: "MAILBOX_ID_REQUIRED" });
	assert.throws(() => store.remove("outbox", " "), { code: "MAILBOX_ID_REQUIRED" });
});

test("receipt ID length is bounded before file-path hashing", (t) => {
	const { store } = harness(t);
	assert.throws(() => store.put("outbox", "x".repeat(1025), {}), { code: "MAILBOX_ID_TOO_LONG" });
});

test("count quota limits independent receipts instead of conflating identifiers", (t) => {
	const { store } = harness(t, { maxCount: 1, maxBytes: 4096 });
	store.put("outbox", "first", { output: 42 });
	assert.throws(() => store.put("outbox", "second", { output: 99 }), /mailbox_/);
	assert.equal(store.get("outbox", "first").value.output, 42);
	assert.equal(store.get("outbox", "second"), null);
});

test("byte quota does not overwrite prior receipt on rejection", (t) => {
	const { store } = harness(t, { maxCount: 10, maxBytes: 280 });
	store.put("outbox", "small", { message: "ok" });
	assert.throws(() => store.put("outbox", "large", { message: "x".repeat(500) }), /mailbox_/);
	assert.equal(store.get("outbox", "small").value.message, "ok");
});
