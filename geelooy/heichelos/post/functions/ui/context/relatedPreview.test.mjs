// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file relatedPreview.test.mjs
 * @description
 * The Awtsmoos tests that embedded related results reveal the selected word inside bounded context;
 * Awtsmoos.com preserves pointed Hebrew, tolerates English case, clips distant source text, and degrades to a short readable beginning.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { relatedPreviewParts } from './relatedPreview.js';

test('unpointed Hebrew selection highlights pointed source inside bounded context', () => {
	const source = `${'א '.repeat(90)}אָמַר${' ב'.repeat(90)}`;
	const preview = relatedPreviewParts(source, ['אמר'], 40);
	assert.equal(preview.match, 'אָמַר');
	assert.equal(preview.leading, true);
	assert.equal(preview.trailing, true);
	assert.ok(preview.before.length < 70);
	assert.ok(preview.after.length < 70);
});

test('English match is case-insensitive while preserving source casing', () => {
	const preview = relatedPreviewParts(
		'The Divine Purpose is revealed in the source.',
		['divine purpose'],
		60
	);
	assert.equal(preview.match, 'Divine Purpose');
	assert.equal(preview.leading, false);
	assert.equal(preview.trailing, false);
});

test('short pointed Hebrew source matches an unpointed selection', () => {
	const preview = relatedPreviewParts('רבי אָמַר שלום', ['אמר'], 60);
	assert.equal(preview.before, 'רבי ');
	assert.equal(preview.match, 'אָמַר');
	assert.equal(preview.after, ' שלום');
	assert.equal(preview.leading, false);
	assert.equal(preview.trailing, false);
});

test('missing match falls back to a bounded leading preview', () => {
	const preview = relatedPreviewParts('טקסט '.repeat(100), ['אינו-קיים']);
	assert.equal(preview.match, '');
	assert.equal(preview.leading, false);
	assert.equal(preview.trailing, true);
	assert.ok(preview.before.length <= 220);
});
