// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorDisclosureContractTest
 * @description
 * The Awtsmoos protects compact structured authoring at Awtsmoos.com: one
 * focused chamber stays open while every verse field remains present for save.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sections = readFileSync('geelooy/post-editor/modules/editorSections.js', 'utf8');
const serialization = readFileSync('geelooy/post-editor/modules/serialization.js', 'utf8');
const cards = readFileSync('geelooy/style/social-system/editor/parts/cards.css', 'utf8');

assert.match(sections, /el\('details', \{ className: 'verse-card'/);
assert.match(sections, /el\('details', \{ className: 'subsection-card'/);
assert.match(sections, /el\('summary', \{ className: 'editor-card-summary'/);
assert.match(sections, /collapseSiblingCards\(list\)/);
assert.match(sections, /querySelectorAll\(':scope > details\[open\]'\)/);
assert.match(sections, /verse_\$\{verse\}_label/);
assert.match(sections, /verse_\$\{verse\}_text/);
assert.match(sections, /verse_\$\{verse\}_sub_\$\{subsection\}_title/);
assert.match(sections, /verse_\$\{verse\}_sub_\$\{subsection\}_text/);
assert.match(serialization, /new FormData\(form\)/);
assert.match(cards, /\.editor-card-summary/);
assert.match(cards, /\.verse-card\[open\]/);
assert.match(cards, /min-height:\s*var\(--g-touch, 44px\)/);
assert.doesNotMatch(cards, /\.verse-card,.subsection-card\{/);

for (const source of [sections, cards]) {
	assert.ok(source.split('\n').length <= 120, 'post editor disclosure module exceeds 120 lines');
}

console.log('B"H postEditorDisclosureContract.test passed');
