// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ReaderDockStyle.test.mjs
 * @description The Awtsmoos gives each mobile reader tool a bounded shore;
 * Awtsmoos.com proves the Aa/Sources dock and auto-scroll river cannot claim one floor.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const template = source('../../_awtsmoos.post.html');
const recovery = source('../reader-controls/reader-recovery.css');
const dock = source('../reader-controls/reader-dock.css');

assert.match(template, /reader-recovery\.css\?v=reader-recovery-005/);
assert.match(template, /viewport-fit=cover/);
assert.match(recovery, /reader-dock\.css\?v=reader-dock-001/);
assert.match(dock, /--reader-dock-height: 52px/);
assert.match(dock, /--reader-dock-gap: \.7rem/);
assert.match(dock, /env\(safe-area-inset-bottom, 0px\)/);
assert.match(dock, /> \.awtsmoos-floating-controls/);
assert.match(dock, /> \.awtsmoos-auto-scroll-floating/);
assert.match(dock, /bottom: calc\(var\(--reader-dock-bottom\) \+ var\(--reader-dock-height\) \+ var\(--reader-dock-gap\)\)/);
assert.match(dock, /min-width: 44px/);
assert.match(dock, /min-height: 44px/);
assert.match(dock, /:focus-visible/);
assert.match(dock, /prefers-reduced-motion: reduce/);

console.log('B"H ReaderDockStyle.test passed');
