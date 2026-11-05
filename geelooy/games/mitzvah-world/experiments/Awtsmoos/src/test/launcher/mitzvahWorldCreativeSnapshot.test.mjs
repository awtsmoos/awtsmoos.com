// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MITZVAH_WORLD_CAPTURE_FORMAT,
	createMitzvahWorldCreativeSnapshot,
	normalizeMitzvahWorldCreativeSnapshot
} from '../../launcher/MitzvahWorldCreativeSnapshot.js';

const SAFE_RETURN = '/games/mitzvahWorld/?mode=world&session=singleplayer&worldId=village&quality=high#gate';

test('creative snapshot keeps bounded transforms and sanitized session provenance', () => {
	const diagnostics = {
		runtime: {
			camera: {
				fov: 55,
				position: { toArray: () => [1.12345678, 2, 3] },
				rotation: { x: 0.1, y: 0.2, z: 0.3 }
			},
			player: {
				id: 'player-main',
				position: { x: 4, y: 5, z: 6 },
				rotation: { x: 0, y: 1, z: 0 }
			},
			renderer: { secret: true }
		}
	};
	const snapshot = createMitzvahWorldCreativeSnapshot(diagnostics, {
		now: '2026-08-02T20:00:00.000Z',
		location: {
			pathname: '/games/mitzvahWorld/',
			search: '?session=solo&world=village&quality=high&realtimeUrl=wss://secret&token=hidden',
			hash: '#gate'
		},
		sessionMode: 'single',
		document: { title: 'Mitzvah World', documentElement: { dataset: {} } }
	});
	assert.equal(snapshot.format, MITZVAH_WORLD_CAPTURE_FORMAT);
	assert.deepEqual(snapshot.camera.position, [1.123457, 2, 3]);
	assert.deepEqual(snapshot.player.position, [4, 5, 6]);
	assert.equal(snapshot.source.href, SAFE_RETURN);
	assert.equal(snapshot.source.returnHref, SAFE_RETURN);
	assert.equal(snapshot.source.sessionMode, 'singleplayer');
	assert.equal(snapshot.source.worldId, 'village');
	assert.equal(JSON.stringify(snapshot).includes('secret'), false);
	assert.equal('renderer' in snapshot, false);
});

test('snapshot normalization rejects foreign paths and ignores unsafe source fields', () => {
	const base = {
		format: MITZVAH_WORLD_CAPTURE_FORMAT,
		capturedAt: '2026-08-02T20:00:00.000Z',
		source: {
			href: '/games/mitzvahWorld/?world=village&session=solo',
			returnHref: '/games/mitzvahWorld/?world=village&session=solo',
			credentials: { token: 'hidden' },
			peers: [{ id: 'other-player' }]
		}
	};
	const normalized = normalizeMitzvahWorldCreativeSnapshot(base);
	assert.equal(normalized.source.worldId, 'village');
	assert.equal(normalized.source.sessionMode, 'singleplayer');
	assert.equal('credentials' in normalized.source, false);
	assert.equal('peers' in normalized.source, false);
	assert.equal(normalizeMitzvahWorldCreativeSnapshot({
		...base,
		source: { href: 'https://evil.example/world', returnHref: '/games/mitzvahWorld/' }
	}), null);
	assert.equal(normalizeMitzvahWorldCreativeSnapshot({ ...base, capturedAt: 'invalid' }), null);
});
