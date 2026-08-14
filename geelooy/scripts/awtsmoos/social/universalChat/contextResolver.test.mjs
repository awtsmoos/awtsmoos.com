// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one Social Hub Space become one bounded Universal Torah context without replacing canonical Heichel or series identity;
 * Awtsmoos.com tests only deterministic route-to-context derivation so public discussion never drifts into an accidental generic room.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveUniversalChatContext } from './contextResolver.js';

function locationLike(pathname, search = '') {
	return { pathname, search };
}

const documentLike = { title: 'Awtsmoos Social Hub' };

test('Social Hub Heichel and series become one Space chat context', () => {
	assert.deepEqual(
		resolveUniversalChatContext(
			locationLike('/social-hub/', '?heichel=beit-alpha&series=torah-weekly'),
			documentLike
		),
		{
			kind: 'space',
			id: 'space:beit-alpha:torah-weekly',
			label: 'Space: Beit Alpha › Torah Weekly'
		}
	);
});

test('Space context defaults missing series to root', () => {
	assert.equal(
		resolveUniversalChatContext(
			locationLike('/social-hub/', '?heichel=beit-alpha'),
			documentLike
		).id,
		'space:beit-alpha:root'
	);
});

test('Social Hub without a Heichel remains ordinary page context', () => {
	assert.equal(
		resolveUniversalChatContext(
			locationLike('/social-hub/', ''),
			documentLike
		).kind,
		'page'
	);
});
