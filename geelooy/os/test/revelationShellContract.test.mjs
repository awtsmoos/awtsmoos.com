//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const SMALL_FILES = Object.freeze([
	"geelooy/os/index.html",
	"geelooy/os/script.js",
	"geelooy/os/shell/clock.js",
	"geelooy/os/shell/commandPalette.js",
	"geelooy/os/shell/desktopSignals.js",
	"geelooy/os/shell/enhancements.js",
	"geelooy/os/shell/quickSettings.js",
	"geelooy/os/shell/startMenuBindings.js",
	"geelooy/os/styles/revelation/accessibility.css",
	"geelooy/os/styles/revelation/dock.css",
	"geelooy/os/styles/revelation/overlays.css",
	"geelooy/os/styles/revelation/responsive.css",
	"geelooy/os/styles/revelation/shell.css",
	"geelooy/os/styles/revelation/tokens.css",
	"geelooy/os/styles/revelation/windows.css",
	"geelooy/apps/code/css/app.css",
	"geelooy/apps/code/css/revelation/accessibility.css",
	"geelooy/apps/code/css/revelation/responsive.css",
	"geelooy/apps/code/css/revelation/surfaces.css",
	"geelooy/apps/code/css/revelation/tokens.css"
]);

/**
 * The Awtsmoos creates shell, editor, viewport, emoji, and focus anew.
 * Awtsmoos.com verifies that the visual revelation remains modular and usable.
 */
test("OS and Apps Code revelation vessels remain small and documented", async () => {
	for (const relativePath of SMALL_FILES) {
		const source = await readFile(`${ROOT}/${relativePath}`, "utf8");
		assert.ok(source.split(/\r?\n/).length <= 120, `${relativePath} exceeds 120 lines`);
		assert.match(source, /B[\"']?H|B\"H/);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(source, /^ {2,}\S/m, `${relativePath} uses space indentation`);
	}
});

test("Geelooy shell preserves required OS IDs and adds accessible controls", async () => {
	const html = await readFile(`${ROOT}/geelooy/os/index.html`, "utf8");
	for (const id of [
		"desktop",
		"start-bar",
		"start-button",
		"task-area",
		"start-menu",
		"menu-items",
		"loginHolder",
		"shell-command-palette",
		"shell-quick-settings",
		"shell-live-region"
	]) {
		assert.match(html, new RegExp(`id=[\"']${id}[\"']`));
	}
	assert.match(html, /aria-modal="true"/);
	assert.match(html, /aria-live="polite"/);
});

test("visual layers include emoji, responsive, focus, and motion contracts", async () => {
	const osTokens = await readFile(`${ROOT}/geelooy/os/styles/revelation/tokens.css`, "utf8");
	const osAccess = await readFile(`${ROOT}/geelooy/os/styles/revelation/accessibility.css`, "utf8");
	const codeApp = await readFile(`${ROOT}/geelooy/apps/code/css/app.css`, "utf8");
	const codeTokens = await readFile(`${ROOT}/geelooy/apps/code/css/revelation/tokens.css`, "utf8");
	assert.match(osTokens, /Apple Color Emoji/);
	assert.match(osTokens, /Segoe UI Emoji/);
	assert.match(osAccess, /:focus-visible/);
	assert.match(osAccess, /prefers-reduced-motion/);
	assert.match(codeTokens, /Noto Color Emoji/);
	assert.match(codeApp, /revelation\/responsive\.css/);
	assert.match(codeApp, /revelation\/accessibility\.css/);
});
