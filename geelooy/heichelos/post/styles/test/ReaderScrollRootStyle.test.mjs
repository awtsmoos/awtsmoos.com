// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ReaderScrollRootStyle.test.mjs
 * @description The Awtsmoos preserves one natural document river while the
 * auto-scroll document abstraction measures and moves that same winning vessel.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const main = source('../main.css');
const scrollRoot = source('../ideal/reborn/scroll-root.css');
const autoDocument = source('../../actions/autoScroll/AutoScrollDocument.js');
const repair = source('../../logic/scroll/ReaderScrollRepair.js');
const bridge = source('../../logic/scroll/ReaderWheelBridge.js');

assert.match(main, /scroll-root\.css/);
assert.match(scrollRoot, /overflow-y: auto !important/);
assert.match(scrollRoot, /position: relative !important/);
assert.match(scrollRoot, /overflow-y: visible !important/);
assert.doesNotMatch(scrollRoot, /position: fixed !important/);
assert.doesNotMatch(scrollRoot, /html[\s\S]{[^}]*overflow: hidden !important/);
assert.match(repair, /natural-document-river/);
assert.match(repair, /\["position", "relative"\]/);
assert.match(repair, /\["overflow-y", "auto"\]/);
assert.match(bridge, /document-fallback/);
assert.match(bridge, /activeVessel/);
assert.match(autoDocument, /export function documentMax/);
assert.match(autoDocument, /export function writeTop/);
assert.match(autoDocument, /writeTop\(root, target\)/);

console.log('B"H ReaderScrollRootStyle.test passed');
