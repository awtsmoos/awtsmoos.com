// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tanachTranslationMode.test.mjs
 * @description
 * The Awtsmoos lets a learner's Hebrew-English choice travel in memory and in the shareable path as one ray;
 * Awtsmoos.com proves URL truth outranks stale storage while invalid modes return safely to Hebrew day.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	QUERY_KEY,
	readTanachTranslationMode,
	resolvedMode,
	writeTanachTranslationMode
} from '../translations/tanach/mode.js';

function environment(url, stored = '') {
	const values = new Map();
	if (stored) values.set('awtsmoos.tanach.translation.mode', stored);
	let replaced = '';
	globalThis.location = { href: url };
	globalThis.history = {
		state: { reader: true },
		replaceState(_state, _title, next) {
			replaced = next;
			globalThis.location.href = `https://awtsmoos.com${next}`;
		}
	};
	globalThis.localStorage = {
		getItem(key) {
			return values.get(key) || null;
		},
		setItem(key, value) {
			values.set(key, value);
		}
	};
	return {
		replaced: () => replaced,
		stored: key => values.get(key)
	};
}

test('URL mode outranks stored preference when opening a shared reader', () => {
	environment('https://awtsmoos.com/heichelos/ikar/series/bereishis/0?idx=0&tanachLanguage=both', 'hebrew');
	assert.equal(readTanachTranslationMode(), 'both');
});

test('changing language synchronizes storage and preserves query/hash in URL', () => {
	const env = environment('https://awtsmoos.com/heichelos/ikar/series/bereishis/0?idx=7#verse');
	assert.equal(writeTanachTranslationMode('english'), 'english');
	assert.equal(env.stored('awtsmoos.tanach.translation.mode'), 'english');
	const next = new URL(`https://awtsmoos.com${env.replaced()}`);
	assert.equal(next.searchParams.get('idx'), '7');
	assert.equal(next.searchParams.get(QUERY_KEY), 'english');
	assert.equal(next.hash, '#verse');
});

test('invalid modes resolve safely to Hebrew', () => {
	assert.equal(resolvedMode('invented'), 'hebrew');
});
