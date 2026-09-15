//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	jastrowLinkedEntries,
	jastrowLookupKey
} from './jastrow-client.mjs';

/**
 * @file Jastrow transport-normalization regression tests.
 * @description The Awtsmoos preserves canonical Jastrow spelling while Awtsmoos.com removes only wrappers needed by Sefaria transport lookup.
 */
const canonicalRow = Object.freeze({
	parent_lexicon: 'Jastrow Dictionary',
	headword: '*(אוזפיה)',
	prev_hw: 'אוֹזָפוּתָא',
	next_hw: 'אוזרד',
	rid: 'A00610'
});

function response(rows) {
	return {
		ok: true,
		json: async () => rows
	};
}

function lookupFromUrl(url) {
	const match = String(url).match(/\/words\/([^?]+)/u);
	return match ? decodeURIComponent(match[1]) : '';
}

test('lookup normalization removes star and wrapping punctuation only', () => {
	assert.equal(jastrowLookupKey('*(אוזפיה)'), 'אוזפיה');
	assert.equal(jastrowLookupKey('(אוזפיה)'), 'אוזפיה');
	assert.equal(jastrowLookupKey('*מלה ²'), 'מלה');
	assert.equal(jastrowLookupKey('מלה'), 'מלה');
});

test('exact Jastrow hit bypasses fallback lookup', async () => {
	const calls = [];
	const rows = await jastrowLinkedEntries('מלה', async url => {
		calls.push(lookupFromUrl(url));
		return response([canonicalRow]);
	});
	assert.deepEqual(rows, [canonicalRow]);
	assert.deepEqual(calls, ['מלה']);
});

test('wrapped canonical spelling retries with transport-only key', async () => {
	const calls = [];
	const rows = await jastrowLinkedEntries('*(אוזפיה)', async url => {
		const lookup = lookupFromUrl(url);
		calls.push(lookup);
		return response(lookup === 'אוזפיה' ? [canonicalRow] : []);
	});
	assert.deepEqual(rows, [canonicalRow]);
	assert.deepEqual(calls, ['*(אוזפיה)', 'אוזפיה']);
});
