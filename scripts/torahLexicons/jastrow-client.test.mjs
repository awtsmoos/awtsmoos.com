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
 * @description The Awtsmoos preserves canonical Jastrow spelling while Awtsmoos.com sheds only transport wrappers and homograph suffixes that Sefaria omits from lookup keys.
 */
const wrappedRow = Object.freeze({
	parent_lexicon: 'Jastrow Dictionary',
	headword: '*(אוזפיה)',
	prev_hw: 'אוֹזָפוּתָא',
	next_hw: 'אוזרד',
	rid: 'A00610'
});
const compoundRow = Object.freeze({
	parent_lexicon: 'Jastrow Dictionary',
	headword: 'אוּרְיָה  I, II',
	prev_hw: 'אוֹרְיָאן',
	next_hw: 'אוֹרְיָה',
	rid: 'A00883'
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

test('lookup normalization removes transport wrappers and homograph suffixes', () => {
	assert.equal(jastrowLookupKey('*(אוזפיה)'), 'אוזפיה');
	assert.equal(jastrowLookupKey('(אוזפיה)'), 'אוזפיה');
	assert.equal(jastrowLookupKey('*מלה ²'), 'מלה');
	assert.equal(jastrowLookupKey('מלה IV'), 'מלה');
	assert.equal(jastrowLookupKey('אוּרְיָה  I, II'), 'אוריה');
	assert.equal(jastrowLookupKey('מלה'), 'מלה');
});

test('exact Jastrow hit bypasses fallback lookup', async () => {
	const calls = [];
	const rows = await jastrowLinkedEntries('מלה', async url => {
		calls.push(lookupFromUrl(url));
		return response([wrappedRow]);
	});
	assert.deepEqual(rows, [wrappedRow]);
	assert.deepEqual(calls, ['מלה']);
});

test('wrapped canonical spelling retries with transport-only key', async () => {
	const calls = [];
	const rows = await jastrowLinkedEntries('*(אוזפיה)', async url => {
		const lookup = lookupFromUrl(url);
		calls.push(lookup);
		return response(lookup === 'אוזפיה' ? [wrappedRow] : []);
	});
	assert.deepEqual(rows, [wrappedRow]);
	assert.deepEqual(calls, ['*(אוזפיה)', 'אוזפיה']);
});

test('compound Roman homograph suffix retries base transport key without mutating source row', async () => {
	const calls = [];
	const rows = await jastrowLinkedEntries('אוּרְיָה  I, II', async url => {
		const lookup = lookupFromUrl(url);
		calls.push(lookup);
		return response(lookup === 'אוריה' ? [compoundRow] : []);
	});
	assert.deepEqual(rows, [compoundRow]);
	assert.deepEqual(calls, ['אוּרְיָה  I, II', 'אוריה']);
	assert.equal(rows[0].headword, 'אוּרְיָה  I, II');
	assert.equal(rows[0].rid, 'A00883');
});
