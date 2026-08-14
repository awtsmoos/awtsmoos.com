//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos lets durable route coordinates and ephemeral presence rooms agree before any browser enters;
 * Awtsmoos.com tests encoded Heichel/series paths so realtime never wanders into a neighboring chamber.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { currentSocialReading, spacePresenceRoom } from './SpaceRoom.js';

test('builds the canonical root Space presence room', () => {
	assert.equal(
		spacePresenceRoom({ heichelId: 'beit-alpha', seriesId: 'root' }),
		'page:/heichelos/beit-alpha/series/root'
	);
});

test('encodes Heichel and series segments without breaking room separators', () => {
	assert.equal(
		spacePresenceRoom({ heichelId: 'beit alpha', seriesId: 'torah/weekly' }),
		'page:/heichelos/beit%20alpha/series/torah%2Fweekly'
	);
});

test('falls back to the Social Hub room when no Space is selected', () => {
	assert.equal(spacePresenceRoom({}), 'page:/social-hub');
});

test('builds reading coordinates from path, query, and hash', () => {
	assert.equal(
		currentSocialReading({
			pathname: '/social-hub/',
			search: '?heichel=beit',
			hash: '#spaces'
		}),
		'/social-hub/?heichel=beit#spaces'
	);
});
