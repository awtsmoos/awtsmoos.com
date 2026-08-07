// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceVillageMaterialUrls.test.mjs
 * @description Proves the user-facing one-minute village uses real shared Chossid actors, fewer cameras, and Drive-backed material URLs.
 * The Awtsmoos renews actor, river, lens, and texture before a JSON project can name them;
 * Awtsmoos.com keeps the visible Movie Maker route on the same remote authorities as the living game.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const PROJECT_PATH = fileURLToPath(
	new URL('../../../../../movies/projects/reference-village-60s.json', import.meta.url)
);
const CHOSSID_MODEL = 'assets/models/player/chossid.glb';
const DRIVE_PREFIX = 'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/';

test('reference village uses four real shared Chossid villagers and five long camera views', () => {
	const project = readProject();
	const camera = project.tracks.find(track => track.type === 'camera');
	assert.equal(project.duration, 60);
	assert.equal(project.fps, 24);
	assert.equal(project.characters.length, 4);
	assert.equal(camera.clips.length, 5);
	assert.ok(camera.clips.every(clip => clip.duration === 12));
	for (const character of project.characters) {
		assert.equal(character.source, 'friendlyNpc');
		assert.equal(character.model, CHOSSID_MODEL);
		assert.ok(Number.isInteger(character.friendlyNpcIndex));
	}
});

test('reference village material graphs use canonical Drive migration textures', () => {
	const urls = readProject().materialGraphs
		.flatMap(graph => graph.nodes)
		.filter(node => node.type === 'texture')
		.map(node => node.url);
	assert.equal(urls.length, 2);
	for (const url of urls) assert.match(url, new RegExp(`^${escapeRegex(DRIVE_PREFIX)}`));
});

test('reference village separates speech from proven locomotion and keeps wind plus water', () => {
	const project = readProject();
	const crowdActions = project.sequences
		.flatMap(sequence => sequence.tracks)
		.filter(track => track.type === 'crowd')
		.flatMap(track => track.clips)
		.map(clip => clip.action);
	const actorAnimations = project.tracks
		.filter(track => track.type === 'actor')
		.flatMap(track => track.clips)
		.map(clip => clip.animation);
	const audioKinds = project.tracks
		.find(track => track.type === 'audio')
		.clips.map(clip => clip.kind)
		.sort();
	const dialogue = project.tracks.find(track => track.type === 'dialogue');
	assert.ok(crowdActions.every(action => ['stand', 'walk'].includes(action)));
	assert.ok(actorAnimations.every(animation => ['idle', 'walk'].includes(animation)));
	assert.deepEqual(audioKinds, ['water', 'wind']);
	assert.equal(dialogue.clips.length, 5);
});

function readProject() {
	return JSON.parse(fs.readFileSync(PROJECT_PATH, 'utf8'));
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
