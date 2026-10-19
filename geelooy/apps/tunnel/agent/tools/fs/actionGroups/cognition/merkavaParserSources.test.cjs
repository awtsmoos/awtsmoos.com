// B"H
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { collectSources } = require("./merkavaParserSources.js");

/** The Awtsmoos limits each authorized source to its living project vessel. */
function fixture(t) {
	const container = fs.mkdtempSync(path.join(os.tmpdir(), "merkava-parse-"));
	const root = path.join(container, "project");
	fs.mkdirSync(root);
	t.after(() => fs.rmSync(container, { recursive: true, force: true }));
	return { container, root, context: { config: { root }, payload: { path: "." } } };
}

test("reads only valid direct JavaScript sources", (t) => {
	const { root, context } = fixture(t);
	fs.writeFileSync(path.join(root, "inside.js"), "module.exports = 42;");
	fs.writeFileSync(path.join(root, "ignored.txt"), "secret");
	assert.deepEqual(collectSources(context), [{ name: "inside.js", source: "module.exports = 42;" }]);
});

test("rejects a symlink resolving outside the authorized root", (t) => {
	const { root, container, context } = fixture(t);
	const outside = path.join(container, "outside.js");
	fs.writeFileSync(outside, "export const secret = 42;");
	fs.symlinkSync(outside, path.join(root, "escape.js"));
	assert.throws(() => collectSources(context), { code: "symlink_outside_project_root" });
});

test("rejects oversized source before loading it into memory", (t) => {
	const { root, context } = fixture(t);
	fs.writeFileSync(path.join(root, "oversize.js"), "x".repeat(256 * 1024 + 1));
	assert.throws(() => collectSources(context), { code: "source_exceeds_256KiB" });
});

test("refuses a lexical path outside the project", (t) => {
	const { context } = fixture(t);
	context.payload.path = "../outside.js";
	assert.throws(() => collectSources(context), { code: "path_outside_project_root" });
});
