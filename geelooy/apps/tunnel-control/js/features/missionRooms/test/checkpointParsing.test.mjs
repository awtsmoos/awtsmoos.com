// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves checkpoint Markdown remains readable data rather than executable HTML.
 * @description
 * The Awtsmoos lets headings, source, and metadata remain visible while
 * Awtsmoos.com rejects dangerous link schemes and never invents missing checkpoint text.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { safeHref, inlineTokens } from "../../markdown/markdownInline.js";
import { markdownBlocks } from "../../markdown/markdownBlocks.js";
import { checkpointModel } from "../checkpointModel.js";

test("safe links allow navigation without executable schemes", () => {
	assert.equal(safeHref("javascript:alert(1)"), "");
	assert.equal(safeHref("data:text/html,x"), "");
	assert.equal(safeHref("https://awtsmoos.com/docs"), "https://awtsmoos.com/docs");
	assert.equal(safeHref("./checkpoint.md"), "./checkpoint.md");
	assert.equal(safeHref("#next"), "#next");
});

test("inline HTML remains inert text data", () => {
	const tokens = inlineTokens("<script>alert(1)</script> **safe**");
	assert.equal(tokens[0].type, "text");
	assert.match(tokens[0].text, /<script>/);
	assert.equal(tokens.at(-1).type, "strong");
});

test("block parser keeps headings lists quotes and fenced code structured", () => {
	const blocks = markdownBlocks([
		"# Checkpoint",
		"- one",
		"> witness",
		"```js",
		"const x = '<tag>';",
		"```"
	].join("\n"));
	assert.deepEqual(blocks.map(block => block.type), [
		"heading",
		"listItem",
		"quote",
		"codeBlock"
	]);
	assert.match(blocks[3].text, /<tag>/);
});

test("checkpoint model prefers real markdown and preserves complete metadata", () => {
	const model = checkpointModel({
		id: "cp-1",
		markdown: "# Live",
		content: "older field",
		secretLookingButVisibleMetadata: "still source data"
	});
	assert.equal(model.field, "markdown");
	assert.equal(model.text, "# Live");
	assert.match(model.metadata, /secretLookingButVisibleMetadata/);
});

test("checkpoint model falls back to metadata without inventing prose", () => {
	const model = checkpointModel({ id: "cp-2", state: "running" });
	assert.equal(model.hasText, false);
	assert.match(model.source, /"state": "running"/);
});

test("live mission progress panel is wired to the safe checkpoint adapter", () => {
	const source = fs.readFileSync(
		new URL("../progressPanel.js", import.meta.url),
		"utf8"
	);
	assert.match(source, /checkpointPanel\(checkpoint\)/);
	assert.doesNotMatch(source, /checkpoint\.summary \|\| checkpoint\.id/);
});
