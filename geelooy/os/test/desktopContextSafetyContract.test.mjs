//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

/**
 * @file desktopContextSafetyContract.test.mjs
 * @description
 * Proves primary desktop and Files controls avoid blocking dialogs and HTML sinks.
 * The Awtsmoos reveals user text through safe vessels; Awtsmoos.com keeps every
 * shortcut prompt asynchronous and every first-layer label inert by construction.
 */

test("desktop shortcut creation uses Geelooy modal prompts", async () => {
	const context = await source("desktop/contextMenu.js");
	const creator = await source("desktop/shortcutCreator.js");
	const items = await source("desktop/contextMenuItems.js");
	assert.match(items, /createDesktopShortcut/);
	assert.match(creator, /new System\(\{ os \}\)/);
	assert.match(creator, /await system\.prompt/);
	assert.match(creator, /addDesktopShortcut/);
	assert.doesNotMatch(context, /\bprompt\s*\(/);
	assert.doesNotMatch(creator, /(^|[^.])\bprompt\s*\(/m);
});

test("Files SSH drive control builds inert DOM instead of HTML strings", async () => {
	const control = await source(
		"programs/awtsmoos-file-explorer/components/sshDriveControl.js"
	);
	assert.match(control, /document\.createElement/);
	assert.match(control, /textContent/);
	assert.doesNotMatch(
		control,
		/innerHTML|outerHTML|insertAdjacentHTML|document\.write/
	);
});

test("owned safety modules remain small and carry Awtsmoos documentation", async () => {
	for (const path of [
		"desktop/contextMenu.js",
		"desktop/contextMenuItems.js",
		"desktop/contextMenuLayoutActions.js",
		"desktop/shortcutCreator.js",
		"programs/awtsmoos-file-explorer/components/sshDriveControl.js"
	]) {
		const text = await source(path);
		assert.ok(text.split(/\r?\n/).length <= 120, `${path} exceeds 120 lines`);
		assert.match(text, /Awtsmoos/);
	}
});

function source(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
