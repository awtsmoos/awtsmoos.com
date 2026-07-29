//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

/**
 * @file responsiveShellContract.test.mjs
 * @description
 * The Awtsmoos proves one shell becomes desktop, tablet, and pocket vessel.
 * Awtsmoos.com keeps safe areas, touch grids, and dynamic-viewport sheets source-owned.
 */

test("OS index loads every launcher, dock, command, and responsive layer", async () => {
	const html = await source("index.html");
	for (const stylesheet of [
		"dock-pinned.css",
		"command.css",
		"launcher.css",
		"launcher-records.css",
		"responsive.css",
		"responsive-mobile.css"
	]) {
		assert.match(html, new RegExp(stylesheet.replace(".", "\\.")));
	}
	for (const id of [
		"shell-pinned-apps",
		"task-area",
		"start-menu",
		"menu-items",
		"shell-command-palette"
	]) {
		assert.match(html, new RegExp(`id=["']${id}["']`));
	}
});

test("mobile desktop uses compact columns without artificial overflow", async () => {
	const css = await source("styles/base/mobile/desktopSurface.js");
	assert.match(css, /grid-template-columns: repeat\(3/);
	assert.match(css, /grid-template-columns: repeat\(2/);
	assert.doesNotMatch(css, /560px|100svh \+|232px/);
	assert.match(css, /min-height: 104px/);
});

test("phone launcher and windows honor dynamic safe-area geometry", async () => {
	const mobile = await source("styles/revelation/responsive-mobile.css");
	const windows = await source("styles/base/mobile/windowSheet.js");
	const viewport = await source("shell/viewportMetrics.js");
	assert.match(mobile, /max-height: min\(86dvh/);
	assert.match(mobile, /--geo-visual-bottom-gap/);
	assert.match(mobile, /env\(safe-area-inset-bottom\)/);
	assert.match(mobile, /repeat\(3, minmax\(0, 1fr\)\)/);
	assert.match(viewport, /visualViewport/);
	assert.match(viewport, /createFixedBottomProbe/);
	assert.match(windows, /var\(--geo-dock-height/);
	assert.match(windows, /min-width: 44px/);
	assert.match(windows, /height: calc\(100% - 46px\)/);
});

async function source(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
