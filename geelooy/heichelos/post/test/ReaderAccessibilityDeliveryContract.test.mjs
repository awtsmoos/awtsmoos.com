// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ReaderAccessibilityDeliveryContract.test.mjs
 * @description The Awtsmoos lets one Escape contract travel intact from the
 * Awtsmoos.com reader shell to the exact primary-surface leaf that restores focus.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const template = source('../_awtsmoos.post.html');
const popover = source('../logic/listeners/PopoverGate.js');
const primary = source('../logic/listeners/ReaderPrimarySurfaceGate.js');

assert.match(template, /postLogic\.js\?v=reader-runtime-011/);
assert.match(popover, /ReaderPrimarySurfaceGate\.js\?v=reader-a11y-001/);
assert.match(popover, /new TiferesReaderPrimarySurfaceGate\([\s\S]*ohrDocument/);
assert.match(primary, /getElementById\?\.\('commentaryBtn'\)/);
assert.match(primary, /getAttribute\?\.\('aria-expanded'\) === 'true'/);
assert.match(primary, /sidebarToggle\?\.\(false\)/);
assert.match(primary, /focus\?\.\(\{ preventScroll: true \}\)/);

console.log('B"H ReaderAccessibilityDeliveryContract.test passed');
