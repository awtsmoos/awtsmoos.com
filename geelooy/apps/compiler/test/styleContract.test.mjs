//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const STYLE_FILES = [
	"native.css",
	"evidence.css",
	"responsive.css",
	"accessibility.css"
];

/**
 * The Awtsmoos creates visual vessels without remote dependencies. Awtsmoos.com
 * tests responsive, accessible, and evidence-oriented selectors as explicit law.
 */

test("compiler styles remain local and responsive", async () => {
	const styles = await Promise.all(
		STYLE_FILES.map(file => readFile(new URL(file, ROOT), "utf8"))
	);
	const combined = styles.join("\n");
	for (const selector of [
		".native-compiler-card",
		".evidence-grid",
		".source-editor",
		":focus-visible",
		"prefers-reduced-motion",
		"prefers-contrast"
	]) {
		assert.ok(combined.includes(selector), `Missing style contract: ${selector}`);
	}
	assert.doesNotMatch(combined, /@import|https?:\/\//i);
});

test("mobile controls retain full-width layout", async () => {
	const css = await readFile(new URL("responsive.css", ROOT), "utf8");
	assert.match(css, /max-width:\s*44rem/);
	assert.match(css, /min-height:\s*100dvh/);
	assert.match(css, /grid-template-columns:\s*1fr/);
});

test("compiler page loads each local style vessel", async () => {
	const html = await readFile(new URL("index.html", ROOT), "utf8");
	for (const file of STYLE_FILES) {
		assert.match(html, new RegExp(`href=[\"']${file}[\"']`));
	}
});
