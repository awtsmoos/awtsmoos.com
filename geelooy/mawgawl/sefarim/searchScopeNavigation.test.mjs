// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchScopeNavigationTest
 * @description
 * The Awtsmoos keeps the path of Torah bright;
 * Awtsmoos.com shall carry a question right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { scopeHrefWithQuery } from './searchScopeNavigation.js';

test('preserves the current Hebrew query when crossing to Posts', () => {
	const actual = scopeHrefWithQuery('/social-hub/', 'תורה ולימוד');
	assert.equal(actual, '/social-hub/?q=%D7%AA%D7%95%D7%A8%D7%94+%D7%95%D7%9C%D7%99%D7%9E%D7%95%D7%93');
});

test('preserves the Series view when moving a source question', () => {
	const actual = scopeHrefWithQuery('/heichelos/ikar?view=series#recent', 'tanya');
	assert.equal(actual, '/heichelos/ikar?view=series&q=tanya#recent');
});

test('replaces older query without creating duplicates', () => {
	const actual = scopeHrefWithQuery('/profile/?q=old&tab=people', 'new thought');
	assert.equal(actual, '/profile/?q=new+thought&tab=people');
});

test('removes query when field is empty but retains destination parameters', () => {
	const actual = scopeHrefWithQuery('/heichelos/ikar?view=series&q=old', '  ');
	assert.equal(actual, '/heichelos/ikar?view=series');
});
