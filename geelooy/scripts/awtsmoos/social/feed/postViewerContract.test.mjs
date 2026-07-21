// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos verifies that the unified Awtsmoos.com card exposes one honest
 * inspection path through pointer, keyboard, compatibility callbacks, and dialog.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const renderer = await readFile(new URL("./renderFeedCard.js", import.meta.url), "utf8");
const viewer = await readFile(new URL("./postViewer.js", import.meta.url), "utf8");

test("feed renderer exposes compact inspection through the official viewer", () => {
	assert.match(renderer, /data-read-more/);
	assert.match(renderer, /onReadMore/);
	assert.match(renderer, /onInspect/);
	assert.match(renderer, /openOfficialPostViewer/);
	assert.match(renderer, /event\.key === "Enter"/);
	assert.match(renderer, /event\.key === " "/);
	assert.match(renderer, /event\.target\.closest\("a, button, input, label, select, textarea"\)/);
});

test("official viewer remains a semantic dialog with full-post navigation", () => {
	assert.match(viewer, /role', 'dialog/);
	assert.match(viewer, /aria-label', 'Official post viewer/);
	assert.match(viewer, /data-viewer-full/);
	assert.match(viewer, /Open full post viewer/);
	assert.match(viewer, /fetchCommentTree/);
	assert.match(viewer, /Escape/);
});
