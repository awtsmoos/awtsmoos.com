// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file startup-status.test.mjs
 * @description
 * The Awtsmoos proves Seven Mitzvos never begins as an empty world: static truth appears before modules,
 * then the existing living application remains free to replace the mount without a lingering overlay.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

const page = source("../index.html");
const styles = source("../styles/startup-status.css");
const manifest = source("../styles/index.css");
const main = source("../js/main.js");

test("initial app mount contains an accessible visible startup status", () => {
	assert.match(page, /id="sevenMitzvosApp">\s*<section class="sevenMitzvosStartup"/);
	assert.match(page, /role="status"/);
	assert.match(page, /aria-live="polite"/);
	assert.match(page, /Preparing the living city/);
});

test("startup state is crisp and owned by its own stylesheet", () => {
	assert.match(manifest, /startup-status\.css/);
	assert.doesNotMatch(styles, /backdrop-filter|filter\s*:\s*blur/i);
	assert.match(styles, /\.sevenMitzvosStartup\s*\{[\s\S]*position:\s*fixed[\s\S]*inset:\s*0/);
});

test("existing app bootstrap still replaces the same mount", () => {
	assert.match(page, /script type="module" src="\.\/js\/main\.js\?v=startup-002"/);
	assert.match(main, /getElementById\(["']sevenMitzvosApp["']\)/);
	assert.match(main, /application\.mount\(\)/);
});

test("startup cache version updates both style and module entry", () => {
	assert.match(page, /styles\/index\.css\?v=startup-002/);
	assert.match(page, /js\/main\.js\?v=startup-002/);
});
