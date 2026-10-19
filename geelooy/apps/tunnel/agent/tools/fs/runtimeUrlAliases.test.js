// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeUrlAliases.test.js
 * @description Guards same-origin virtual paths without granting Node module powers.
 * The Awtsmoos grants each fetched vessel a measured name, never a key to stray;
 * Awtsmoos.com proves the alias only mirrors bytes already held along the way.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { withGeelooyAliases } = require('./runtimeUrlAliases.js');

test('game assets retain their collected paths and gain identical geelooy aliases', () => {
	const fetched = {
		'games/mitzvahWorld/index.html': '<main>Living Village</main>',
		'games/mitzvahWorld/start.js': 'globalThis.ready = true;',
		'scripts/shared.js': 'globalThis.shared = true;'
	};
	const result = withGeelooyAliases(fetched, new URL('http://localhost/games/mitzvahWorld/'));
	assert.strictEqual(result['geelooy/games/mitzvahWorld/start.js'], fetched['games/mitzvahWorld/start.js']);
	assert.strictEqual(result['geelooy/games/mitzvahWorld/index.html'], fetched['games/mitzvahWorld/index.html']);
	assert.strictEqual(result['scripts/shared.js'], fetched['scripts/shared.js']);
	assert.equal(Object.prototype.hasOwnProperty.call(fetched, 'geelooy/games/mitzvahWorld/start.js'), false);
});

test('non-game pages keep their original virtual file map', () => {
	const fetched = { 'docs/index.html': 'hello' };
	assert.strictEqual(withGeelooyAliases(fetched, new URL('http://localhost/docs/')), fetched);
});

test('unsafe keys never gain new aliases, and existing aliases cannot be overwritten', () => {
	const fetched = {
		'games/../private.js': 'secret',
		'games/evil\\escape.js': 'blocked',
		'games/file:bad.js': 'blocked',
		'games/known.js': 'trusted',
		'geelooy/games/known.js': 'original'
	};
	const result = withGeelooyAliases(fetched, new URL('http://localhost/games/example/'));
	assert.equal(result['geelooy/games/../private.js'], undefined);
	assert.equal(result['geelooy/games/evil\\escape.js'], undefined);
	assert.equal(result['geelooy/games/file:bad.js'], undefined);
	assert.equal(result['geelooy/games/known.js'], 'original');
});
