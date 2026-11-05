// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieShortSpec } from '../movie/shorts/MovieShortSpec.js';

const base = {
	beats: [
		{ duration: 10, text: 'one' },
		{ duration: 10, text: 'two' },
		{ duration: 10, text: 'three' }
	],
	title: 'Layout test'
};

test('Short spec defaults to world-first layout', () => {
	assert.equal(normalizeMovieShortSpec(base).layout, 'world-first');
});

test('Short spec accepts named compatibility layout', () => {
	assert.equal(normalizeMovieShortSpec({ ...base, layout: 'speaker-forward' }).layout, 'speaker-forward');
});

test('Short spec rejects unknown layout profiles', () => {
	assert.throws(() => normalizeMovieShortSpec({ ...base, layout: 'mystery' }), /Unknown Short layout profile/);
});
