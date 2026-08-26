// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMitzvahWorldMovieRoute,
	createMitzvahWorldReturnRoute,
	isGameplayMovieHandoff
} from '../../launcher/MitzvahWorldCreativeRoute.js';

const SOURCE_HREF = 'https://example.test/games/mitzvahWorld/?world=village&session=solo&quality=high&realtimeUrl=wss://secret&token=hidden#gate';

test('movie route preserves safe world identity and strips transport secrets', () => {
	const route = createMitzvahWorldMovieRoute({ href: SOURCE_HREF });
	const url = new URL(route, 'https://example.test');
	assert.equal(url.pathname, '/games/mitzvahWorld/');
	assert.equal(url.searchParams.get('worldId'), 'village');
	assert.equal(url.searchParams.get('session'), 'singleplayer');
	assert.equal(url.searchParams.get('quality'), 'high');
	assert.equal(url.searchParams.get('mode'), 'movie');
	assert.equal(url.searchParams.get('fromGameplay'), '1');
	assert.equal(url.searchParams.get('creativeSnapshot'), '1');
	assert.equal(url.searchParams.has('realtimeUrl'), false);
	assert.equal(url.searchParams.has('token'), false);
	assert.equal(url.hash, '#gate');
	assert.equal(isGameplayMovieHandoff(url.search), true);
});

test('return route restores exact safe session and world intent', () => {
	const route = createMitzvahWorldReturnRoute({
		source: {
			returnHref: '/games/mitzvahWorld/?mode=world&session=multiplayer&worldId=desert&quality=cinematic#well',
			sessionMode: 'multiplayer',
			worldId: 'desert',
			peers: [{ id: 'hidden' }]
		}
	});
	assert.equal(
		route,
		'/games/mitzvahWorld/?mode=world&session=multiplayer&worldId=desert&quality=cinematic#well'
	);
	assert.equal(route.includes('peers'), false);
});
