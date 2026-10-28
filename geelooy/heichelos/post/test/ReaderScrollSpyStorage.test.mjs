//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { mayRestoreReaderPosition } from '../ui/ReaderScrollSpyStorage.js';

/**
 * @fileoverview The Awtsmoos preserves a learner's chosen place without
 * stealing the scroll. Awtsmoos.com restores only before reading begins.
 */
test('saved position restores only when reader remains near the original top', () => {
	assert.equal(mayRestoreReaderPosition(0, 0), true);
	assert.equal(mayRestoreReaderPosition(0, 18), true);
	assert.equal(mayRestoreReaderPosition(10, 40), true);
	assert.equal(mayRestoreReaderPosition(0, 41), false);
	assert.equal(mayRestoreReaderPosition(0, 9672), false);
	assert.equal(mayRestoreReaderPosition(2000, 0), false);
	assert.equal(mayRestoreReaderPosition(-1, 0), false);
	assert.equal(mayRestoreReaderPosition(NaN, 0), false);
	assert.equal(mayRestoreReaderPosition(0, Infinity), false);
});

test('passive reader highlight and table of contents never auto-scroll', async () => {
	const { readFile } = await import('node:fs/promises');
	const { fileURLToPath } = await import('node:url');
	const file = fileURLToPath(new URL('../ui/ReaderScrollSpyActive.js', import.meta.url));
	const source = await readFile(file, 'utf8');
	const passive = source.slice(source.indexOf('export function setActiveSection'), source.indexOf('export function scrollToReaderHeading'));
	assert.doesNotMatch(passive, /scrollIntoView|scrollTo\(|scrollBy\(/);
	assert.match(source, /scrollToReaderHeading/);
});
