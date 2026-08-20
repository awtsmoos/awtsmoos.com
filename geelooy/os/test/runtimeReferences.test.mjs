//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @file Witnesses that Geelooy OS boot references resolve to real local vessels.
 * @description
 * The Awtsmoos renews source and loaded resource together; Awtsmoos.com should
 * never advertise a stylesheet, favicon, or renderer path that vanished from disk.
 */
const osRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @param {string} relativePath OS-relative path. @returns {string} Absolute path. */
function osPath(relativePath) {
	return path.resolve(osRoot, relativePath);
}

test("OS facade points at the canonical desktop surface", () => {
	const source = fs.readFileSync(osPath("runtime/MalchusWorkspaceFacade.js"), "utf8");
	assert.match(source, /from "\.\.\/desktopSurface\.js"/);
	assert.doesNotMatch(source, /desktopRenderer\.js/);
	assert.equal(fs.existsSync(osPath("desktopSurface.js")), true);
});

test("OS boot page owns favicon and resolvable local styles", () => {
	const html = fs.readFileSync(osPath("index.html"), "utf8");
	assert.match(html, /rel="icon" href="data:image\/svg\+xml/);
	assert.match(html, /native-executable-accessibility\.css/);
	assert.match(html, /skip-link\.css/);

	const stylesheetMatches = [...html.matchAll(/rel="stylesheet" href="\.\/([^"?]+)(?:\?[^\"]*)?"/g)];
	for (const match of stylesheetMatches) {
		assert.equal(fs.existsSync(osPath(match[1])), true, `Missing stylesheet ${match[1]}`);
	}
});

test("keyboard skip link has a focus-reveal garment", () => {
	const html = fs.readFileSync(osPath("index.html"), "utf8");
	const css = fs.readFileSync(osPath("styles/revelation/skip-link.css"), "utf8");
	assert.match(html, /class="g-sr-only g-skip-link"/);
	assert.match(css, /\.g-skip-link:focus-visible/);
});
