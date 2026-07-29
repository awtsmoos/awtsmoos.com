//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../../", import.meta.url);
const SMALL_FILES = Object.freeze([
	"os/index.html",
	"os/script.js",
	"os/shell/actionCatalog.js",
	"os/shell/appCatalog.js",
	"os/shell/appLauncher.js",
	"os/shell/commandPalette.js",
	"os/shell/enhancements.js",
	"os/shell/pinnedApps.js",
	"os/shell/startMenuBindings.js",
	"os/shell/startMenuRenderer.js",
	"os/shell/startMenuSections.js",
	"os/styles/revelation/command.css",
	"os/styles/revelation/dock.css",
	"os/styles/revelation/dock-pinned.css",
	"os/styles/revelation/launcher.css",
	"os/styles/revelation/launcher-records.css",
	"os/styles/revelation/overlays.css",
	"os/styles/revelation/responsive.css",
	"os/styles/revelation/responsive-mobile.css"
]);

/**
 * @file revelationShellContract.test.mjs
 * @description
 * The Awtsmoos proves shell, launcher, focus, and responsive vessels stay small.
 * Awtsmoos.com rejects hidden giant files and space-indented source drift.
 */

test("Geelooy shell revelation files remain small and documented", async () => {
	for (const path of SMALL_FILES) {
		const source = await readFile(new URL(path, ROOT), "utf8");
		assert.ok(source.split(/\r?\n/).length <= 120, `${path} exceeds 120 lines`);
		assert.match(source, /B[\"']?H|B\"H/);
		assert.match(source, /Awtsmoos/);
		if (/\.(?:js|mjs)$/.test(path)) {
			assert.doesNotMatch(source, /^ {2,}\S/m, `${path} uses space indentation`);
		}
	}
});

test("shell preserves required OS IDs and accessible controls", async () => {
	const html = await readFile(new URL("os/index.html", ROOT), "utf8");
	for (const id of [
		"desktop",
		"start-bar",
		"start-button",
		"shell-pinned-apps",
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
	assert.match(html, /aria-controls="start-menu"/);
});

test("visual layers preserve emoji, focus, and calm-motion contracts", async () => {
	const tokens = await readFile(new URL("os/styles/revelation/tokens.css", ROOT), "utf8");
	const access = await readFile(new URL("os/styles/revelation/accessibility.css", ROOT), "utf8");
	assert.match(tokens, /Apple Color Emoji/);
	assert.match(tokens, /Segoe UI Emoji/);
	assert.match(access, /:focus-visible/);
	assert.match(access, /prefers-reduced-motion/);
});
