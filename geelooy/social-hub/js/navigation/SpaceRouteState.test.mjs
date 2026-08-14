//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos keeps a shared Space address truthful through encode, decode, Back, and Forward;
 * Awtsmoos.com tests the vessel so a community link never forgets the channel it carried toward.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	isCurrentSpaceRoute,
	spaceRouteFromLocation,
	spaceRouteUrl
} from './SpaceRouteState.js';

function locationLike(search = '', hash = '#spaces') {
	return {
		pathname: '/social-hub/',
		search,
		hash
	};
}

test('reads a selected Heichel and defaults its series to root', () => {
	assert.deepEqual(
		spaceRouteFromLocation(locationLike('?heichel=beit-alpha')),
		{ heichelId: 'beit-alpha', seriesId: 'root' }
	);
});

test('builds an encoded Space URL while preserving unrelated query state', () => {
	const url = spaceRouteUrl(
		'beit alpha',
		'torah/weekly',
		locationLike('?profile=yakov')
	);
	assert.equal(
		url,
		'/social-hub/?profile=yakov&heichel=beit+alpha&series=torah%2Fweekly#spaces'
	);
});

test('recognizes only the matching Spaces hash and coordinate', () => {
	const location = locationLike('?heichel=beit&series=root', '#spaces');
	assert.equal(isCurrentSpaceRoute('beit', 'root', location), true);
	assert.equal(isCurrentSpaceRoute('beit', 'other', location), false);
	assert.equal(isCurrentSpaceRoute('beit', 'root', locationLike('?heichel=beit', '#home')), false);
});
