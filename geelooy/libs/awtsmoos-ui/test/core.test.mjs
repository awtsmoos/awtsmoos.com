//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core.test.mjs
 * @description
 * The Awtsmoos renews each boundary where generated data approaches visible form;
 * Awtsmoos.com proves unsafe tags, URLs, attributes, and styles cannot quietly become the norm.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	assertSafeAttributeName,
	assertSafeUiTag,
	escapeUiHtml,
	normalizeSafeAttributeValue,
	normalizeUiNode,
	normalizeUiStyleDeclaration,
	serializeUiStyleObject,
	UI_NODE_TYPES
} from "../src/index.js";

test("escapes hostile HTML text", () => {
	assert.equal(
		escapeUiHtml(`<script>&"'`),
		"&lt;script&gt;&amp;&quot;&#39;"
	);
});

test("rejects executable attribute names and URL protocols", () => {
	assert.throws(() => assertSafeAttributeName("onclick"), /Unsafe UI attribute/);
	assert.throws(
		() => normalizeSafeAttributeValue("href", "javascript:alert(1)"),
		/Unsafe URL protocol/
	);
	assert.equal(normalizeSafeAttributeValue("href", "https://awtsmoos.com"), "https://awtsmoos.com");
});

test("rejects blocked tags while normalizing ordinary values", () => {
	assert.throws(() => assertSafeUiTag("script"), /Unsafe UI tag/);
	assert.equal(normalizeUiNode("light").type, UI_NODE_TYPES.TEXT);
	assert.equal(normalizeUiNode(["one", "two"]).type, UI_NODE_TYPES.FRAGMENT);
	assert.equal(normalizeUiNode({ tag: "section", children: ["three"] }).tag, "section");
});

test("style policy stays deterministic and rejects executable values", () => {
	assert.deepEqual(normalizeUiStyleDeclaration("--awts-gap", "12px"), ["--awts-gap", "12px"]);
	assert.throws(
		() => normalizeUiStyleDeclaration("background", "javascript:evil()"),
		/Unsafe Awtsmoos UI style value/
	);
	assert.equal(
		serializeUiStyleObject({ color: "white", display: "grid" }),
		"color:white;display:grid"
	);
});
