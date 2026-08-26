// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that hidden database depth stays powerful without becoming clutter;
 * Awtsmoos.com keeps the old request contract while the new mobile vessel remains calm and clear.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = relative => readFileSync(new URL(relative, import.meta.url), "utf8");
const html = read("./index.html");
const manifest = read("./style.css");
const css = [
	read("./styles/foundation.css"),
	read("./styles/operations.css"),
	read("./styles/results.css")
].join("\n");
const app = read("./app.js");
const formIds = ["createForm", "readForm", "updateForm", "deleteForm"];

test("standalone document is mobile-first and keeps the B H server vessel", () => {
	assert.match(html, /<!DOCTYPE html>/);
	assert.match(html, /name="viewport"[^>]*viewport-fit=cover/);
	assert.match(html, /return \$a\("bh\.html"\)/);
});

test("all four legacy operation form ids remain", () => {
	for (const id of formIds) assert.match(html, new RegExp(`id="${id}"`));
	assert.equal((html.match(/<form\b/g) || []).length, 4);
});

test("read is the only operation expanded on first load", () => {
	assert.equal((html.match(/<details\b[^>]*\bopen\b/g) || []).length, 1);
	assert.match(html, /<details class="operation-card" open>[\s\S]*id="readForm"/);
});

test("legacy id and record parameter names remain", () => {
	assert.ok((html.match(/name="id"/g) || []).length >= 4);
	assert.equal((html.match(/name="record"/g) || []).length, 2);
});

test("request transport remains url encoded POST to the DB endpoint", () => {
	assert.match(app, /const endpoint = "\/db\/"/);
	assert.match(app, /method: "POST"/);
	assert.match(app, /application\/x-www-form-urlencoded/);
	assert.match(app, /formData\.append\("endpoint", revealEndpoint\(form\)\)/);
	assert.match(app, /form\.id\.replace\("Form", ""\)/);
});

test("responses are exposed as text with success and error states", () => {
	assert.match(html, /id="request-result"[^>]*aria-live="polite"/);
	assert.match(app, /response\.text\(\)/);
	assert.match(app, /resultElement\.textContent/);
	assert.doesNotMatch(app, /innerHTML/);
	assert.match(app, /setState\("Failed", "error"\)/);
});

test("modular styling keeps touch targets large and motion finite", () => {
	assert.match(manifest, /foundation\.css/);
	assert.match(manifest, /operations\.css/);
	assert.match(manifest, /results\.css/);
	assert.match(css, /min-height:\s*44px/);
	assert.match(css, /button\s*\{[^}]*min-height:\s*46px/s);
	assert.doesNotMatch(css, /animation:\s*[^;]*infinite/);
	assert.match(css, /prefers-reduced-motion:\s*reduce/);
	assert.match(css, /box-sizing:\s*border-box/);
});
