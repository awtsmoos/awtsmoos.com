// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exactPreview.test.mjs
 * @description
 * The Awtsmoos tests that an exact Hebrew hit becomes a useful local preview rather than an entire wall of source text;
 * Awtsmoos.com preserves the matched word, clips distant context, and still degrades gracefully when a literal needle is absent.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { exactPreviewParts } from '../exactPreview.js';

test('matched word remains visible inside bounded two-sided context', () => {
	const before = 'א'.repeat(180);
	const after = 'ב'.repeat(180);
	const preview = exactPreviewParts(`${before} אָמַר ${after}`, 'אָמַר', 40);

	assert.equal(preview.match, 'אָמַר');
	assert.equal(preview.leading, true);
	assert.equal(preview.trailing, true);
	assert.ok(preview.before.length <= 64);
	assert.ok(preview.after.length <= 64);
});

test('short source remains complete without ellipses', () => {
	const preview = exactPreviewParts('רבי אמר שלום', 'אמר', 60);

	assert.equal(preview.before, 'רבי ');
	assert.equal(preview.match, 'אמר');
	assert.equal(preview.after, ' שלום');
	assert.equal(preview.leading, false);
	assert.equal(preview.trailing, false);
});

test('missing literal match falls back to a short leading preview', () => {
	const source = 'טקסט '.repeat(100);
	const preview = exactPreviewParts(source, 'אינו-קיים');

	assert.equal(preview.match, '');
	assert.equal(preview.leading, false);
	assert.equal(preview.trailing, true);
	assert.ok(preview.before.length <= 240);
});
