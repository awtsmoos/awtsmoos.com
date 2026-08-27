//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Local and Awtsmoos-remote path contract tests for Geelooy Drive.
 * @description
 * The Awtsmoos renews every road while Awtsmoos.com proves local and remote vocabularies survive normalization unchanged in kind.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	joinWorkspacePath,
	normalizeWorkspacePath,
	parentWorkspacePath,
	workspaceBasename,
	workspaceBreadcrumbs
} from "../core/path.js";

test("normalizes relative and absolute workspace paths", () => {
	assert.equal(normalizeWorkspacePath("a//b/./c"), "a/b/c");
	assert.equal(normalizeWorkspacePath("/a/b/../c"), "/a/c");
	assert.equal(normalizeWorkspacePath("../../"), ".");
	assert.equal(normalizeWorkspacePath("/../../"), "/");
});

test("preserves Awtsmoos remote path vocabulary", () => {
	assert.equal(
		normalizeWorkspacePath("awtsmoos://device/projects/../site"),
		"awtsmoos://device/site"
	);
	assert.equal(
		joinWorkspacePath("awtsmoos://device/site", "src/app.js"),
		"awtsmoos://device/site/src/app.js"
	);
	assert.equal(
		parentWorkspacePath("awtsmoos://device/site/src"),
		"awtsmoos://device/site"
	);
});

test("keeps remote traversal at the remote vocabulary root", () => {
	assert.equal(normalizeWorkspacePath("awtsmoos://../../"), "awtsmoos://");
	assert.equal(parentWorkspacePath("awtsmoos://device"), "awtsmoos://");
});

test("joins local child paths without changing path kind", () => {
	assert.equal(joinWorkspacePath("projects/site", "index.html"), "projects/site/index.html");
	assert.equal(joinWorkspacePath("/Users/me", "../shared"), "/Users/shared");
	assert.equal(joinWorkspacePath("projects/site", "/tmp/file"), "/tmp/file");
});

test("returns stable parents and basenames", () => {
	assert.equal(parentWorkspacePath("projects/site/index.html"), "projects/site");
	assert.equal(parentWorkspacePath("/Users"), "/");
	assert.equal(workspaceBasename("awtsmoos://device/site/index.html"), "index.html");
});

test("builds navigable local and remote breadcrumbs", () => {
	assert.deepEqual(workspaceBreadcrumbs("projects/site"), [
		{ label: "Home", path: "." },
		{ label: "projects", path: "projects" },
		{ label: "site", path: "projects/site" }
	]);
	assert.deepEqual(workspaceBreadcrumbs("awtsmoos://device/site"), [
		{ label: "Remote", path: "awtsmoos://" },
		{ label: "device", path: "awtsmoos://device" },
		{ label: "site", path: "awtsmoos://device/site" }
	]);
});
