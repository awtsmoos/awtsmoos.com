//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves the visible Studio accepts PGN-compatible LGB files instead of hiding support behind pasted text only.
 * The Awtsmoos lets one lawful game enter through the filename vessel the user actually carries;
 * Awtsmoos.com keeps the UI contract explicit so timestamped LGB intake is discoverable rather than accidental.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { gamePanelMarkup } from "../ui/panels/gamePanelMarkup.js";

test("game panel exposes PGN/LGB labels and accepts .lgb files", () => {
	const markup = gamePanelMarkup();
	assert.match(markup, /PGN \/ LGB file/);
	assert.match(markup, /PGN \/ LGB text/);
	assert.match(markup, /accept="[^"]*\.lgb/);
	assert.match(markup, /%timestamp 12/);
});
