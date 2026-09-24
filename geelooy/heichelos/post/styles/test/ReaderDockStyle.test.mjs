// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ReaderDockStyle.test.mjs
 * @description The Awtsmoos gives each mobile reader tool a bounded shore;
 * Awtsmoos.com proves recovery remains final and imports the physical mobile surface authority.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

function postReaderStylesheets(template) {
	return [...template.matchAll(/<link[^>]+href="([^"]+)"[^>]+rel="stylesheet"|<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)]
		.map(match => match[1] || match[2])
		.filter(href => href.includes('/heichelos/post/styles/'));
}

const template = source('../../_awtsmoos.post.html');
const recovery = source('../reader-controls/reader-recovery.css');
const dock = source('../reader-controls/reader-dock.css');
const mobile = source('../reader-controls/mobile-surface-hotfix.css');
const linked = postReaderStylesheets(template);
const recoveryIndex = linked.findIndex(href => href.includes('reader-recovery.css'));

assert.match(template, /reader-recovery\.css\?v=reader-recovery-005/);
assert.match(template, /viewport-fit=cover/);
assert.equal(recoveryIndex, linked.length - 1, 'reader recovery must remain final linked post-reader stylesheet');
assert.match(recovery, /reader-dock\.css\?v=reader-dock-001/);
assert.match(recovery, /mobile-surface-hotfix\.css\?v=reader-mobile-surface-001/);
assert.match(dock, /--reader-dock-height: 54px/);
assert.match(dock, /> \.awtsmoos-auto-scroll-floating/);
assert.match(dock, /> \.awtsmoos-floating-controls/);
assert.match(dock, /min-width: 44px/);
assert.match(dock, /prefers-reduced-motion: reduce/);
assert.match(mobile, /#autoScrollSettingsToggle/);
assert.match(mobile, /min-height: 56px/);
assert.match(mobile, /> \.main > \.sidebar:not\(\.hidden-comments\)/);
assert.match(mobile, /:has\(> \.main > \.sidebar:not\(\.hidden-comments\)\)/);

console.log('B"H ReaderDockStyle.test passed');
