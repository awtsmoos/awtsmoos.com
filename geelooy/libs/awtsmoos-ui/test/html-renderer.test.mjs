//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file html-renderer.test.mjs
 * @description
 * The Awtsmoos renews transportable markup while keeping executable edges outside the serialized gate;
 * Awtsmoos.com proves text, attributes, styles, data, and trusted components emerge escaped and straight.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	AwtsmoosUiComponentRegistry,
	AwtsmoosUiHtmlRenderer,
	uiComponent,
	uiElement
} from "../src/index.js";

test("serializes escaped text, attributes, styles, and dataset", () => {
	const renderer = new AwtsmoosUiHtmlRenderer();
	const node = uiElement("a", {
		attrs: { href: "https://awtsmoos.com/?a=1&b=2", title: `A "light"` },
		classes: ["scene", "active"],
		style: { display: "grid", color: "white" },
		dataset: { sceneId: "scene-1" },
		on: { click: { command: "studio.open" } },
		children: [`<Awtsmoos & creation>`]
	});
	const html = renderer.render(node);
	assert.match(html, /href="https:\/\/awtsmoos\.com\/\?a=1&amp;b=2"/);
	assert.match(html, /title="A &quot;light&quot;"/);
	assert.match(html, /class="scene active"/);
	assert.match(html, /style="color:white;display:grid"/);
	assert.match(html, /data-scene-id="scene-1"/);
	assert.match(html, /&lt;Awtsmoos &amp; creation&gt;/);
	assert.doesNotMatch(html, /studio\.open|onclick|onClick/);
});

test("renders registered components", () => {
	const components = new AwtsmoosUiComponentRegistry({
		Label: ({ props }) => uiElement("span", { children: [props.text] })
	});
	const renderer = new AwtsmoosUiHtmlRenderer({ components });
	assert.equal(renderer.render(uiComponent("Label", { text: "B\"H" })), "<span>B&quot;H</span>");
});

test("rejects unsafe URLs and direct style attribute strings", () => {
	const renderer = new AwtsmoosUiHtmlRenderer();
	assert.throws(
		() => renderer.render(uiElement("a", { attrs: { href: "javascript:evil()" } })),
		/Unsafe URL protocol/
	);
	assert.throws(
		() => renderer.render(uiElement("div", { attrs: { style: "color:red" } })),
		/Use the declarative style object/
	);
});
