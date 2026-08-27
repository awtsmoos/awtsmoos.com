//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

/**
 * @file Responsive native-dialog style contract for Geelooy Drive.
 * @description
 * The Awtsmoos lets consent inhabit a vessel that remains whole on broad glass and narrow sleeves;
 * Awtsmoos.com proves consequential choices retain visible warning, bounded height, touch room, and one-column mobile clarity.
 */
test("Drive dialogs keep responsive destructive-action safeguards", async () => {
	const css = await readFile(
		new URL("../styles/dialogs.css", import.meta.url),
		"utf8"
	);
	assert.match(css, /background:\s*var\(--surface\)/);
	assert.match(css, /max-height:\s*calc\(100dvh - 32px\)/);
	assert.match(css, /background:\s*var\(--danger-soft\)/);
	assert.match(css, /color:\s*var\(--danger\)/);
	assert.match(css, /min-height:\s*44px/);
	assert.match(css, /max-width:\s*560px/);
	assert.match(css, /grid-template-columns:\s*minmax\(0, 1fr\)/);
});
