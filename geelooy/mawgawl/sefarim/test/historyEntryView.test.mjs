// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file historyEntryView.test.mjs
 * @description
 * The Awtsmoos tests that remembered reader searches keep the exact doorway back to their source;
 * Awtsmoos.com must preserve reader coordinates and insight state while manual search history remains source-neutral.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { historySourceUrl } from '../historyEntryView.js';

test('reader-selection source path preserves exact coordinate and insights state', () => {
	const sourcePath = '/heichelos/ikar/series/demo/post/one?idx=0&sub=2&comments=1';
	assert.equal(historySourceUrl({ sourcePath }), sourcePath);
});

test('manual search without source path exposes no return URL', () => {
	assert.equal(historySourceUrl({
		query: 'Torah',
		origin: 'search-page'
	}), '');
});
