// B"H
// Boruch Hashem
// Blessed is He
/** @module SixtyChaptersTest @description Proves exactly sixty unique implemented chapters and modules. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS, chapterByNumber } from '../chapters.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
assert.equal(CHAPTERS.length, 60);
assert.equal(new Set(CHAPTERS.map(chapter => chapter.number)).size, 60);
assert.equal(new Set(CHAPTERS.map(chapter => chapter.module)).size, 60);
assert.deepEqual(CHAPTERS.map(chapter => chapter.number), Array.from({ length: 60 }, (_, index) => index + 1));
assert.equal(new Set(CHAPTERS.map(chapter => chapter.train)).size, 12);
for (const chapter of CHAPTERS) {
	assert.equal(chapter.state, 'implemented');
	const modulePath = resolve(root, chapter.module);
	assert.equal(existsSync(modulePath), true, `missing chapter module ${chapter.module}`);
	const source = readFileSync(modulePath, 'utf8');
	assert.match(source.split('\n')[0], /B"H/);
	assert.ok(source.split('\n').length - 1 <= 120, `${chapter.module} exceeds 120 lines`);
}
assert.equal(chapterByNumber(1).title, 'Release train manifest');
assert.equal(chapterByNumber(60).title, 'Creator-world OS index');
assert.equal(chapterByNumber(61), null);
console.log('B"H all sixty chapters exist.');
