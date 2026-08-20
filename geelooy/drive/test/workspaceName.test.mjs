//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Portable workspace-name boundary tests for Geelooy Drive.
 * @description
 * The Awtsmoos renews every name while Awtsmoos.com proves one child name cannot become hidden path traversal.
 * Ordinary creative filenames remain welcome, surrounding whitespace is normalized, and unsafe cross-device names stay outside the vessel.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	assertWorkspaceName,
	normalizeWorkspaceName,
	workspaceNameError
} from "../core/workspaceName.js";

test("accepts ordinary portable names and normalizes surrounding whitespace", () => {
	assert.equal(assertWorkspaceName(" index.html "), "index.html");
	assert.equal(assertWorkspaceName("My Friend Site.md"), "My Friend Site.md");
	assert.equal(normalizeWorkspaceName(" folder "), "folder");
	assert.equal(assertWorkspaceName("name "), "name");
});

test("rejects traversal and path separators", () => {
	assert.match(workspaceNameError(".."), /traversal/i);
	assert.match(workspaceNameError("folder/file.js"), /unsafe/i);
	assert.match(workspaceNameError("folder\\file.js"), /unsafe/i);
});

test("rejects cross-platform reserved names and unstable trailing periods", () => {
	assert.match(workspaceNameError("CON"), /reserved/i);
	assert.match(workspaceNameError("name."), /period or space/i);
	assert.match(workspaceNameError("LPT1.txt"), /reserved/i);
});

test("throws before callers may send an invalid remote mutation", () => {
	assert.throws(() => assertWorkspaceName("../escape"), /unsafe/i);
	assert.throws(() => assertWorkspaceName(""), /enter a file or folder name/i);
});
