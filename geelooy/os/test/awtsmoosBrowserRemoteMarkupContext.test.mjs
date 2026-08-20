//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves inert markup text cannot become remote resource or import-map authority.
 * @description The Awtsmoos separates quoted/raw/template stories from live document
 * declarations; Awtsmoos.com grants network authority only to active resource markup.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	htmlResourceRefs
} from "../programs/awtsmoos-browser/remoteHtmlResources.js";
import {
	importMapFromHtml,
	resolveMappedSpecifier
} from "../programs/awtsmoos-browser/remoteImportMap.js";

const PAGE_URL = "https://site.test/app/index.html";

test("inline script text cannot create nested external resource tags", () => {
	const html = [
		`<script>const fake = '<script src="/fake.js"><\\/script>';</script>`,
		`<script src="/live.js"></script>`,
		`<link rel="stylesheet" href="./live.css">`
	].join("\n");
	const parsed = htmlResourceRefs(html, PAGE_URL);
	assert.deepEqual(
		parsed.refs.map(ref => ref.url),
		["https://site.test/live.js", "https://site.test/app/live.css"]
	);
});

test("commented import maps cannot declare bare module authority", () => {
	const html = [
		`<!-- <script type="importmap">{"imports":{"lib":"https://evil.test/lib.mjs"}}</script> -->`,
		`<script type="importmap">{"imports":{"real":"./real.mjs"}}</script>`
	].join("\n");
	const map = importMapFromHtml(html, PAGE_URL);
	assert.equal(resolveMappedSpecifier("lib", PAGE_URL, map), null);
	assert.equal(
		resolveMappedSpecifier("real", PAGE_URL, map),
		"https://site.test/app/real.mjs"
	);
});

test("template and raw-text bodies cannot manufacture live resource tags", () => {
	const html = [
		`<template><script src="/template.js"></script><link rel="stylesheet" href="/template.css"></template>`,
		`<style>.x::before{content:'<script src="/style.js"></script>'}</style>`,
		`<textarea><link rel="stylesheet" href="/textarea.css"></textarea>`,
		`<script src="/live.js"></script>`
	].join("\n");
	const parsed = htmlResourceRefs(html, PAGE_URL);
	assert.deepEqual(parsed.refs.map(ref => ref.url), ["https://site.test/live.js"]);
});

test("template-contained import maps remain inert", () => {
	const html = [
		`<template><script type="importmap">{"imports":{"ghost":"https://evil.test/ghost.mjs"}}</script></template>`,
		`<script type="importmap">{"imports":{"real":"./real.mjs"}}</script>`
	].join("\n");
	const map = importMapFromHtml(html, PAGE_URL);
	assert.equal(resolveMappedSpecifier("ghost", PAGE_URL, map), null);
	assert.equal(
		resolveMappedSpecifier("real", PAGE_URL, map),
		"https://site.test/app/real.mjs"
	);
});
