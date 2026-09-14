//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

/**
 * @file responsiveShellContract.test.mjs
 * @description
 * Proves one Geelooy shell becomes a compact phone vessel without hiding depth.
 * The Awtsmoos renews desktop and pocket forms together; Awtsmoos.com preserves
 * safe areas, search, disclosure, and touch geometry across those manifestations.
 */

test("OS index loads simple launcher, dock, and responsive layers", async function indexContract() {
	const html = await source("index.html");
	for (const stylesheet of [
		"dock-pinned.css",
		"launcher.css",
		"launcher-records.css",
		"launcher-disclosures.css",
		"launcher-mobile.css",
		"responsive.css",
		"responsive-mobile.css",
		"skip-link.css"
	]) {
		assert.match(html, new RegExp(stylesheet.replace(".", "\\.")));
	}
	assert.match(html, /simple-surface-1/);
	assert.match(html, /Geelooy OS · Files · Media · Sites · Code/);
});

test("mobile desktop selector matches the real surface and stays compact", async function desktopContract() {
	const css = await source("styles/base/mobile/desktopSurface.js");
	assert.match(css, /\.awtsmoos-desktop-surface\.desktop-mobile/);
	assert.doesNotMatch(css, /\.desktop-mobile \.awtsmoos-desktop-surface/);
	assert.match(css, /grid-template-columns: repeat\(2/);
	assert.match(css, /min-height: 88px/);
	assert.match(css, /\.desktop-icon-badge/);
	assert.match(css, /display: none !important/);
	assert.doesNotMatch(css, /560px|100svh \+|232px/);
});

test("phone launcher and windows honor dynamic safe-area geometry", async function geometryContract() {
	const launcher = await source("styles/revelation/launcher-mobile.css");
	const windows = await source("styles/base/mobile/windowSheet.js");
	const viewport = await source("shell/viewportMetrics.js");
	assert.match(launcher, /max-height: min\(82dvh/);
	assert.match(launcher, /--geo-visual-bottom-gap/);
	assert.match(launcher, /env\(safe-area-inset-bottom\)/);
	assert.match(launcher, /repeat\(2, minmax\(0, 1fr\)\)/);
	assert.match(launcher, /min-height: 88px/);
	assert.match(viewport, /visualViewport/);
	assert.match(viewport, /createFixedBottomProbe/);
	assert.match(windows, /var\(--geo-dock-height/);
	assert.match(windows, /min-width: 44px/);
});

test("skip link is quiet until keyboard focus explicitly reveals it", async function skipLinkContract() {
	const css = await source("styles/revelation/skip-link.css");
	assert.match(css, /\.g-skip-link \{/);
	assert.match(css, /clip-path: inset\(50%\)/);
	assert.match(css, /\.g-skip-link:focus-visible/);
	assert.match(css, /clip-path: none !important/);
});

/** Reads one authored OS source file for stable source-owned layout contracts. */
async function source(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
