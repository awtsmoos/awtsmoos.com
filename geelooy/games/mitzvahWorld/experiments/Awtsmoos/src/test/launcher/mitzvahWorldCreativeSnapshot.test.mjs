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

test('creative snapshot captures only bounded camera, player, and source facts', () => {
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
		location: { pathname: '/games/mitzvahWorld/', search: '?session=solo', hash: '#village' },
		sessionMode: 'single',
		document: { title: 'Mitzvah World', documentElement: { dataset: {} } }
	});
	assert.equal(snapshot.format, MITZVAH_WORLD_CAPTURE_FORMAT);
	assert.deepEqual(snapshot.camera.position, [1.123457, 2, 3]);
	assert.deepEqual(snapshot.player.position, [4, 5, 6]);
	assert.equal(snapshot.source.href, '/games/mitzvahWorld/?session=solo#village');
	assert.equal('renderer' in snapshot, false);
});

test('snapshot normalization rejects foreign and malformed source paths', () => {
	const base = {
		format: MITZVAH_WORLD_CAPTURE_FORMAT,
		capturedAt: '2026-08-02T20:00:00.000Z',
		source: { href: '/games/mitzvahWorld/', returnHref: '/games/mitzvahWorld/' }
	};
	assert.ok(normalizeMitzvahWorldCreativeSnapshot(base));
	assert.equal(normalizeMitzvahWorldCreativeSnapshot({
		...base,
		source: { href: 'https://evil.example/world', returnHref: '/games/mitzvahWorld/' }
	}), null);
	assert.equal(normalizeMitzvahWorldCreativeSnapshot({ ...base, capturedAt: 'invalid' }), null);
});
