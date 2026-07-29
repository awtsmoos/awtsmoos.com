//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

/**
 * @file shellInteractionContract.test.mjs
 * @description
 * The Awtsmoos proves keyboard, focus, action feedback, and pending state are shared.
 * Awtsmoos.com rejects shell surfaces that silently fork interaction law.
 */

test("shared result navigation covers movement, activation, and escape", async () => {
	const source = await text("shell/resultNavigation.js");
	for (const key of ["ArrowDown", "ArrowUp", "Home", "End", "Enter", "Escape"]) {
		assert.match(source, new RegExp(key));
	}
	assert.match(source, /scrollIntoView/);
	assert.match(source, /aria-selected/);
	assert.match(source, /tabIndex/);
});

test("action runner guards duplicate work and always restores controls", async () => {
	const source = await text("shell/actionRunner.js");
	assert.match(source, /dataset\.running === "true"/);
	assert.match(source, /aria-busy/);
	assert.match(source, /button\.disabled = running/);
	assert.match(source, /finally/);
	assert.match(source, /notifyShell/);
	assert.match(source, /console\.error/);
});

test("each overlay restores its own invoking control", async () => {
	const start = await text("shell/startMenuBindings.js");
	const command = await text("shell/commandPalette.js");
	const settings = await text("shell/quickSettings.js");
	assert.match(start, /restoreConnectedFocus\(button\)/);
	assert.match(command, /restoreConnectedFocus\(trigger\)/);
	assert.match(settings, /restoreConnectedFocus\(trigger\)/);
	assert.doesNotMatch(command, /previousFocus/);
	assert.doesNotMatch(settings, /previousFocus/);
});

test("Start, command, pinned apps, and settings share interaction utilities", async () => {
	const start = await text("shell/startMenuRenderer.js");
	const command = await text("shell/commandPalette.js");
	const pinned = await text("shell/pinnedApps.js");
	const settings = await text("shell/quickSettings.js");
	assert.match(start, /createShellActionRunner/);
	assert.match(start, /bindResultNavigation/);
	assert.match(command, /createShellActionRunner/);
	assert.match(command, /bindResultNavigation/);
	assert.match(command, /bindFocusTrap/);
	assert.match(pinned, /createShellActionRunner/);
	assert.match(settings, /bindFocusTrap/);
	assert.match(settings, /removeEventListener/);
});

test("feedback stylesheet exposes running, selected, fallback, and resize states", async () => {
	const source = await text("styles/revelation/feedback.css");
	assert.match(source, /\[data-running="true"\]/);
	assert.match(source, /window-resize-grip/);
	assert.match(source, /@supports not \(backdrop-filter/);
	assert.match(source, /prefers-reduced-motion/);
});

function text(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
