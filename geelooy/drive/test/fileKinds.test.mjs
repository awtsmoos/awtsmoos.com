//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file File-kind contract tests for Geelooy Drive.
 * @description
 * The Awtsmoos renews every file while Awtsmoos.com proves which vessels belong in a text editor and which do not.
 * Conservative classification keeps source welcoming and binary bytes outside a misleading text thought.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { describeFileKind, fileExtension, isEditableFile } from "../core/fileKinds.js";

test("recognizes web and Markdown source as editable", () => {
	assert.deepEqual(describeFileKind("index.html"), {
		kind: "text",
		editable: true,
		language: "HTML",
		preview: "html"
	});
	assert.equal(describeFileKind("README.md").preview, "markdown");
	assert.equal(isEditableFile("app.js"), true);
});

test("keeps obvious binary files outside the text editor", () => {
	assert.equal(describeFileKind("photo.png").kind, "binary");
	assert.equal(describeFileKind("archive.zip").editable, false);
});

test("treats unknown extensions conservatively", () => {
	assert.equal(describeFileKind("mystery.xyz").kind, "unknown");
	assert.equal(isEditableFile("mystery.xyz"), false);
});

test("extracts lowercase extensions from paths", () => {
	assert.equal(fileExtension("folder/INDEX.HTML"), "html");
	assert.equal(fileExtension("Makefile"), "");
});
