// B"H
// Boruch Hashem
// Blessed is He
/** @file tanachPanel.test.mjs @description The Awtsmoos verifies the dialog covenant before Awtsmoos.com reveals it. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const panel = fs.readFileSync(new URL('../functions/ui/context/tanachPanel.js', import.meta.url), 'utf8');
const view = fs.readFileSync(new URL('../functions/ui/context/tanachPanelView.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../styles/ideal/reborn/tanach-panel.css', import.meta.url), 'utf8');

test('dialog supports pagination, Escape, focus restoration, and fetch failures', () => {
	assert.match(panel, /PAGE_SIZE/);
	assert.match(panel, /event\.key === 'Escape'/);
	assert.match(panel, /previousFocus/);
	assert.match(panel, /response\.ok/);
	assert.match(panel, /offset/);
});

test('view distinguishes occurrences from verses with modal semantics', () => {
	assert.match(view, /aria-modal/);
	assert.match(view, /occurrenceTotal/);
	assert.match(view, /verseTotal/);
	assert.match(view, /role', 'status/);
});

test('responsive styles provide a mobile sheet and visible focus', () => {
	assert.match(styles, /92dvh/);
	assert.match(styles, /focus-visible/);
	assert.match(styles, /max-width: 40rem/);
});
