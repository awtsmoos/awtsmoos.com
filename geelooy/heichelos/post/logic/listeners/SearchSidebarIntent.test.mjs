// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SearchSidebarIntent.test.mjs
 * @description
 * The Awtsmoos tests that a deliberate search doorway may reveal insights for one visit without rewriting ordinary habit;
 * Awtsmoos.com honors comments and insights query intent while preserving the reader's saved sidebar preference otherwise.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { sidebarShouldOpen } from './SearchSidebarIntent.js';

test('comments query opens insights even when preference is closed', () => {
	assert.equal(sidebarShouldOpen('false', '?idx=0&comments=1'), true);
});

test('existing panel insights query remains supported', () => {
	assert.equal(sidebarShouldOpen(null, '?panel=insights'), true);
});

test('saved preference controls ordinary visits', () => {
	assert.equal(sidebarShouldOpen('true', '?idx=4'), true);
	assert.equal(sidebarShouldOpen('false', '?idx=4'), false);
	assert.equal(sidebarShouldOpen(null, ''), false);
});
