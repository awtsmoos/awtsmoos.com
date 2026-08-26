// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceVillageMaterialUrls.test.mjs
 * @description Proves the visible one-minute village uses ten wardrobe-indexed Chossid actors, long cameras, rich actions, and Drive materials.
 * The Awtsmoos renews crowd, garment, river, lens, and texture before JSON can name them;
 * Awtsmoos.com keeps the Movie Maker route on the same canonical human and material authorities as the living game.
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

const SOCIAL_ACTIONS = new Set(['greet', 'nod', 'pray', 'run', 'stand', 'talk', 'walk']);

test('reference village uses ten canonical wardrobe-indexed villagers and five long camera views', () => {
	const project = readProject();
	const camera = project.tracks.find(track => track.type === 'camera');
	assert.equal(project.duration, 60);
	assert.equal(project.fps, 24);
	assert.equal(project.characters.length, 10);
	assert.equal(camera.clips.length, 5);
	assert.ok(camera.clips.every(clip => clip.duration === 12));
	assert.deepEqual(
		project.characters.map(character => character.friendlyNpcIndex),
		Array.from({ length: 10 }, (_, index) => index)
	);
	assert.equal(new Set(project.characters.map(character => character.costume?.outfitId)).size, 10);
	for (const character of project.characters) {
		assert.equal(character.source, 'friendlyNpc');
		assert.equal(character.model, CHOSSID_MODEL);
	}
});

test('every reference villager participates and the crowd uses richer truthful action semantics', () => {
	const project = readProject();
	const crowdTracks = project.sequences
		.flatMap(sequence => sequence.tracks)
		.filter(track => track.type === 'crowd');
	const targets = new Set(crowdTracks.map(track => track.target));
	const actions = crowdTracks.flatMap(track => track.clips).map(clip => clip.action);
	assert.equal(targets.size, 10);
	for (const character of project.characters) assert.ok(targets.has(character.id));
	assert.ok(actions.every(action => SOCIAL_ACTIONS.has(action)));
	for (const action of ['greet', 'nod', 'pray', 'run', 'talk', 'walk']) {
		assert.ok(actions.includes(action), `missing ${action}`);
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

test('reference village keeps canonical principal locomotion, sparse dialogue, wind, and water', () => {
	const project = readProject();
	const actorAnimations = project.tracks
		.filter(track => track.type === 'actor')
		.flatMap(track => track.clips)
		.map(clip => clip.animation);
	const audioKinds = project.tracks
		.find(track => track.type === 'audio')
		.clips.map(clip => clip.kind)
		.sort();
	const dialogue = project.tracks.find(track => track.type === 'dialogue');
	assert.ok(actorAnimations.every(animation => ['idle', 'walk'].includes(animation)));
	assert.deepEqual(audioKinds, ['water', 'wind']);
	assert.equal(dialogue.clips.length, 6);
});

function readProject() {
	return JSON.parse(fs.readFileSync(PROJECT_PATH, 'utf8'));
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
