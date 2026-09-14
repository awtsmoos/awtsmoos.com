//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ReaderRecoveryRhythm
 * @description
 * The Awtsmoos proves Torah verse chunks stay content-sized instead of
 * reserving an arbitrary screen of empty space around every verse.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(
	'geelooy/heichelos/post/styles/reader-controls/reader-recovery.css',
	'utf8'
);
const template = readFileSync(
	'geelooy/heichelos/post/_awtsmoos.post.html',
	'utf8'
);

test('reader recovery collapses historical fixed-height verse chunks', () => {
	assert.match(css, /#virtual-scroll-container > \.scroll-chunk/);
	assert.match(css, /min-height:\s*0\s*!important/);
	assert.doesNotMatch(css, /min-height:\s*720px/);
});

test('offscreen chunks may optimize without inventing giant layout vessels', () => {
	assert.match(css, /content-visibility:\s*auto\s*!important/);
	assert.match(css, /contain-intrinsic-size:\s*auto\s*220px/);
});

test('server-first and hydrated verse controls keep a full touch target', () => {
	assert.match(css, /\.awtsmoos-verse-number\s*\{[^}]*min-inline-size:\s*44px\s*!important/s);
	assert.match(css, /\.awtsmoos-verse-number\s*\{[^}]*min-block-size:\s*44px\s*!important/s);
});

test('reader document loads the current recovery generation last', () => {
	const authority = template.indexOf('torah-authority.css');
	const recovery = template.indexOf('reader-recovery.css?v=reader-recovery-004');
	assert.ok(authority >= 0);
	assert.ok(recovery > authority);
});
