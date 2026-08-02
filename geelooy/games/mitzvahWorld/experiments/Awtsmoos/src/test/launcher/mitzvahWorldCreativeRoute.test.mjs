// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMitzvahWorldMovieRoute,
	isGameplayMovieHandoff
} from '../../launcher/MitzvahWorldCreativeRoute.js';

test('movie route preserves safe world identity and replaces conflicting mode flags', () => {
	const route = createMitzvahWorldMovieRoute({
		href: 'https://example.test/games/mitzvahWorld/?world=village&session=solo&mode=play&movie=old&autoRender=1#gate'
	});
	const url = new URL(route, 'https://example.test');
	assert.equal(url.pathname, '/games/mitzvahWorld/');
	assert.equal(url.searchParams.get('world'), 'village');
	assert.equal(url.searchParams.get('session'), 'solo');
	assert.equal(url.searchParams.get('mode'), 'movie');
	assert.equal(url.searchParams.get('fromGameplay'), '1');
	assert.equal(url.searchParams.get('creativeSnapshot'), '1');
	assert.equal(url.searchParams.has('autoRender'), false);
	assert.equal(url.hash, '#gate');
	assert.equal(isGameplayMovieHandoff(url.search), true);
});
