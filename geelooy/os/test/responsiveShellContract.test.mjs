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
 * Proves phone, landscape, tablet, window, and launcher geometry stay bounded.
 * The Awtsmoos renews every viewport without dividing its truth;
 * Awtsmoos.com lets appearance move while structural position remains unmoved.
 */

test("OS index loads simple launcher and responsive layers", async () => {
	const html = await source("index.html");
	for (const stylesheet of [
		"launcher-disclosures.css",
		"launcher-mobile.css",
		"responsive.css",
		"responsive-mobile.css",
		"skip-link.css"
	]) {
		assert.match(html, new RegExp(stylesheet.replace(".", "\\.")));
	}
	assert.match(html, /Geelooy OS · Files · Media · Sites · Code/);
});

test("mobile desktop selector matches the living compact surface", async () => {
	const css = await source("styles/base/mobile/desktopSurface.js");
	assert.match(css, /\.awtsmoos-desktop-surface\.desktop-mobile/);
	assert.doesNotMatch(css, /\.desktop-mobile \.awtsmoos-desktop-surface/);
	assert.match(css, /grid-template-columns: repeat\(2/);
	assert.match(css, /min-height: 88px/);
	assert.match(css, /\.desktop-icon-badge/);
	assert.match(css, /display: none !important/);
});

test("phone styles share the coarse-pointer landscape boundary", async () => {
	const launcher = await source("styles/revelation/launcher-mobile.css");
	const shell = await source("styles/revelation/responsive-mobile.css");
	for (const css of [launcher, shell]) {
		assert.match(css, /max-width: 720px/);
		assert.match(css, /pointer: coarse/);
		assert.match(css, /max-width: 900px/);
	}
	assert.match(shell, /\.shell-pinned-apps/);
	assert.match(shell, /display: none/);
	assert.match(launcher, /max-height: min\(82dvh/);
});

test("tablet launcher is explicitly contained inside the viewport", async () => {
	const css = await source("styles/revelation/responsive.css");
	assert.match(css, /@media \(max-width: 900px\)/);
	assert.match(css, /left: max\(16px, env\(safe-area-inset-left\)\)/);
	assert.match(css, /right: max\(16px, env\(safe-area-inset-right\)\)/);
	assert.match(css, /width: auto/);
	assert.match(css, /transform: none/);
});

test("phone window sheet bounds its padded desktop vessel", async () => {
	const css = await source("styles/base/mobile/windowSheet.js");
	assert.match(css, /box-sizing: border-box !important/);
	assert.match(css, /width: 100vw !important/);
	assert.match(css, /\.awts-window/);
	assert.match(css, /width: 100% !important/);
});

test("legacy menu animation never overrides structural centering", async () => {
	const css = await source("styles/legacy/start-menu.css");
	const animationSection = css
		.slice(css.indexOf("@keyframes menuUnfold"))
		.split("#menu-items")[0];
	assert.match(animationSection, /opacity: 0/);
	assert.match(animationSection, /opacity: 1/);
	assert.doesNotMatch(animationSection, /transform:/);
});

test("phone windows and viewport metrics preserve visible-bottom truth", async () => {
	const windows = await source("styles/base/mobile/windowSheet.js");
	const viewport = await source("shell/viewportMetrics.js");
	assert.match(viewport, /visualViewport/);
	assert.match(viewport, /createFixedBottomProbe/);
	assert.match(windows, /var\(--geo-dock-height/);
	assert.match(windows, /min-width: 44px/);
});

test("skip link stays quiet until keyboard focus reveals it", async () => {
	const css = await source("styles/revelation/skip-link.css");
	assert.match(css, /clip-path: inset\(50%\)/);
	assert.match(css, /\.g-skip-link:focus-visible/);
	assert.match(css, /clip-path: none !important/);
});

function source(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
