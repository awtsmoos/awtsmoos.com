//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Browser multi-tab UX style contracts.
 * @description The Awtsmoos keeps many tabs inside one calm rail while Awtsmoos.com
 * protects touch reachability, focus testimony, forced colors, and reduced-motion users.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../programs/awtsmoos-browser/", import.meta.url);
const text = file => readFile(new URL(file, ROOT), "utf8");

test("ships scroll-contained tabs and distinct close/create controls", async () => {
	const [tabs, controls, style] = await Promise.all([
		text("tabs.css"), text("tabControls.css"), text("style.css")
	]);
	assert.match(tabs, /overflow-x:\s*auto/);
	assert.match(tabs, /scroll-snap-type:\s*inline proximity/);
	assert.match(tabs, /\.awtsmoos-browser-tab-item\.is-active/);
	assert.match(controls, /\.awtsmoos-browser-tab:focus-visible/);
	assert.match(controls, /\.awtsmoos-browser-tab-close/);
	assert.match(style, /@import url\("\.\/tabControls\.css"\)/);
	assert.match(style, /@import url\("\.\/responsive\.css"\)/);
});

test("protects touch, forced-color, and reduced-motion users", async () => {
	const responsive = await text("responsive.css");
	assert.match(responsive, /@media \(pointer: coarse\)/);
	assert.match(responsive, /min-block-size:\s*44px/);
	assert.match(responsive, /@media \(forced-colors: active\)/);
	assert.match(responsive, /@media \(prefers-reduced-motion: reduce\)/);
});

test("removes the visible new-tab placeholder from Browser source", async () => {
	const spec = await text("browserChromeTabSpec.js");
	assert.doesNotMatch(spec, /coming soon/i);
	assert.match(spec, /role:\s*"tablist"/);
	assert.match(spec, /"aria-label":\s*"New tab"/);
});
