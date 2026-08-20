//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Editor document-state tests for Geelooy Drive.
 * @description
 * The Awtsmoos renews every keystroke while Awtsmoos.com proves a slow save cannot bless newer unsent letters as saved.
 * Baseline and draft remain distinct so asynchronous time never erases the user's truthful editing state.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	commitWorkspaceDocument,
	createWorkspaceDocument,
	updateWorkspaceDraft
} from "../services/workspaceDocument.js";

test("creates a clean document from remote content", () => {
	const document = createWorkspaceDocument("site/index.html", "<h1>Hello</h1>");
	assert.equal(document.name, "index.html");
	assert.equal(document.baseline, "<h1>Hello</h1>");
	assert.equal(document.dirty, false);
});

test("marks local draft changes dirty and allows exact reversion", () => {
	const original = createWorkspaceDocument("README.md", "One");
	const changed = updateWorkspaceDraft(original, "Two");
	assert.equal(changed.dirty, true);
	assert.equal(updateWorkspaceDraft(changed, "One").dirty, false);
});

test("preserves newer edits when an older saved snapshot returns", () => {
	const original = createWorkspaceDocument("app.js", "one");
	const saving = updateWorkspaceDraft(original, "two");
	const newer = updateWorkspaceDraft(saving, "three");
	const committed = commitWorkspaceDocument(newer, saving.content);
	assert.equal(committed.baseline, "two");
	assert.equal(committed.content, "three");
	assert.equal(committed.dirty, true);
});

test("marks the document clean when the persisted snapshot is still current", () => {
	const changed = updateWorkspaceDraft(createWorkspaceDocument("app.js", "one"), "two");
	const committed = commitWorkspaceDocument(changed, "two");
	assert.equal(committed.dirty, false);
});
