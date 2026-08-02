// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { writeMitzvahWorldCreativeSnapshot } from '../../launcher/MitzvahWorldCreativeSnapshotStore.js';
import { importGameplaySnapshotIntoMovieProject } from '../../movie/MovieGameSnapshotImport.js';

class MemoryStorage {
	constructor() { this.values = new Map(); }
	getItem(key) { return this.values.get(key) ?? null; }
	setItem(key, value) { this.values.set(key, String(value)); }
	removeItem(key) { this.values.delete(key); }
}

test('gameplay snapshot import preserves the project and adds provenance metadata only', () => {
	const storage = new MemoryStorage();
	const snapshot = {
		format: 'awtsmoos.mitzvah-world.capture.v1',
		capturedAt: '2026-08-02T20:00:00.000Z',
		source: {
			href: '/games/mitzvahWorld/?world=village',
			returnHref: '/games/mitzvahWorld/?world=village',
			sessionMode: 'single',
			title: 'Mitzvah World'
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
	assert.equal(result.receipt.ok, true);
	assert.equal(result.project.metadata.author, 'Awtsmoos');
	assert.deepEqual(result.project.metadata.gameplayCapture, snapshot);
	assert.deepEqual(result.project.tracks, project.tracks);
	assert.equal(project.metadata.gameplayCapture, undefined);
});
