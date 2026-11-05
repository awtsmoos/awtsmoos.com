// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { writeMitzvahWorldCreativeSnapshot } from '../../launcher/MitzvahWorldCreativeSnapshotStore.js';
import { importGameplaySnapshotIntoMovieProject } from '../../movie/MovieGameSnapshotImport.js';

class MemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.get(key) ?? null;
	}

	setItem(key, value) {
		this.values.set(key, String(value));
	}

	removeItem(key) {
		this.values.delete(key);
	}
}

test('gameplay snapshot import adds safe provenance and a return receipt only', () => {
	const storage = new MemoryStorage();
	const snapshot = {
		format: 'awtsmoos.mitzvah-world.capture.v1',
		capturedAt: '2026-08-02T20:00:00.000Z',
		source: {
			href: '/games/mitzvahWorld/?world=village&session=single&token=hidden',
			returnHref: '/games/mitzvahWorld/?world=village&session=single&token=hidden',
			sessionMode: 'single',
			title: 'Mitzvah World',
			peers: [{ id: 'other-player' }]
		},
		camera: { position: [1, 2, 3], rotation: [0, 1, 0], fov: 50 }
	};
	writeMitzvahWorldCreativeSnapshot(snapshot, storage);
	const project = {
		format: 'awtsmoos.movie.v1',
		metadata: { author: 'Awtsmoos' },
		tracks: [{ id: 'camera' }]
	};
	const result = importGameplaySnapshotIntoMovieProject(project, storage);
	const capture = result.project.metadata.gameplayCapture;
	assert.equal(result.receipt.ok, true);
	assert.equal(result.receipt.sessionMode, 'singleplayer');
	assert.equal(result.receipt.worldId, 'village');
	assert.equal(
		result.receipt.returnHref,
		'/games/mitzvahWorld/?mode=world&session=singleplayer&worldId=village'
	);
	assert.equal(result.project.metadata.author, 'Awtsmoos');
	assert.equal(capture.source.worldId, 'village');
	assert.equal('peers' in capture.source, false);
	assert.equal(JSON.stringify(capture).includes('hidden'), false);
	assert.deepEqual(result.project.tracks, project.tracks);
	assert.equal(project.metadata.gameplayCapture, undefined);
});
