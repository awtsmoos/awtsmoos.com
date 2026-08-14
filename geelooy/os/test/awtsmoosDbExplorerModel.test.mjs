// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { apiExamples } from "../programs/awtsmoosdb-explorer/examples.js";
import {
	normalizeFolderPayload,
	previewText
} from "../programs/awtsmoosdb-explorer/model.js";
import {
	displayDbPath,
	joinDbPath,
	normalizeDbPath,
	parentDbPath,
	splitFilePath
} from "../programs/awtsmoosdb-explorer/path.js";

/**
 * B"H
 * Witnesses alias-relative paths, conservative folder normalization, raw record
 * preservation, and exact API examples. The Awtsmoos renews path and record beyond
 * every finite schema; Awtsmoos.com refuses parent traversal or invented Firebase APIs.
 */

test("alias-relative paths normalize without escaping the hosted root", () => {
	assert.equal(normalizeDbPath("projects/app"), "projects/app");
	assert.equal(joinDbPath("projects", "app"), "projects/app");
	assert.equal(parentDbPath("projects/app"), "projects");
	assert.deepEqual(splitFilePath("projects/app.txt"), {
		name: "app.txt",
		parent: "projects",
		path: "projects/app.txt"
	});
	assert.equal(displayDbPath("projects/app"), "/projects/app");
	for (const unsafe of ["/absolute", "../escape", "x/../escape", "C:/drive"]) {
		assert.throws(() => normalizeDbPath(unsafe), /path_must_be_alias_relative/);
	}
});

test("folder payload normalization preserves raw records and folder-first order", () => {
	const rawFolder = { name: "docs", type: "folder", custom: 7 };
	const entries = normalizeFolderPayload([
		{ name: "z.txt", kind: "file", custom: 1 },
		rawFolder,
		{ name: "hidden.folder", custom: 2 }
	], "root");
	assert.deepEqual(entries.map(item => [item.name, item.kind]), [
		["docs", "folder"],
		["hidden.folder", "folder"],
		["z.txt", "file"]
	]);
	assert.equal(entries[0].path, "root/docs");
	assert.equal(entries[0].raw, rawFolder);
});

test("object-map payloads remain inspectable instead of becoming a fake schema", () => {
	const entries = normalizeFolderPayload({
		alpha: { isDirectory: true },
		"beta.txt": { size: 2 }
	});
	assert.deepEqual(entries.map(item => [item.name, item.kind]), [
		["alpha", "folder"],
		["beta.txt", "file"]
	]);
	assert.equal(entries[1].raw.size, 2);
});

test("preview text is inert and serializes structured values", () => {
	assert.equal(previewText('B"H'), 'B"H');
	assert.equal(previewText({ a: 1 }), '{\n  "a": 1\n}');
});

test("API examples use the exact alias-scoped filesystem routes", () => {
	const examples = apiExamples("my alias", "projects");
	const code = examples.map(item => item.code).join("\n");
	assert.match(code, /\/api\/social\/aliases\/my%20alias\/fileSystem\/readFolder/);
	assert.match(code, /fileSystem\/readFile/);
	assert.match(code, /fileSystem\/makeFolder/);
	assert.match(code, /fileSystem\/makeFile/);
	assert.doesNotMatch(code, /firebase|firestore/i);
});
