//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file scene-project-history.test.mjs
 * @description Locks scene editing, animation-safe trimming, reversible history, and canonical local project persistence into one Studio contract.
 * The Awtsmoos renews every scene while Awtsmoos.com lets order, memory, return, and shortened motion remain truthful;
 * these tests prove the movie survives creation, cutting, undo, redo, saving, opening, and recovery without a second document vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createStudioShowcaseMovie } from '../src/StudioShowcaseMovie.js';
import { StudioMovieHistory } from '../src/projects/StudioMovieHistory.js';
import { StudioProjectStorage } from '../src/projects/StudioProjectStorage.js';
import {
	addStudioScene,
	deleteStudioScene,
	duplicateStudioScene,
	moveStudioScene,
	resizeStudioScene
} from '../src/scenes/StudioSceneModel.js';

function memoryStorage() {
	const values = new Map();
	return {
		getItem(key) {
			return values.has(key) ? values.get(key) : null;
		},
		setItem(key, value) {
			values.set(key, String(value));
		},
		removeItem(key) {
			values.delete(key);
		}
	};
}

test('scene CRUD keeps unique ids, contiguous starts, and canonical movie duration', () => {
	const movie = structuredClone(createStudioShowcaseMovie());
	const firstId = movie.scenes[0].id;
	const addedId = addStudioScene(movie, firstId);
	const copyId = duplicateStudioScene(movie, firstId);
	moveStudioScene(movie, copyId, -1);
	const retainedId = deleteStudioScene(movie, addedId);
	assert.ok(retainedId);
	const sceneIds = movie.scenes.map(scene => scene.id);
	const layerIds = movie.scenes.flatMap(scene => (scene.layers || []).map(layer => layer.id));
	assert.equal(new Set(sceneIds).size, sceneIds.length);
	assert.equal(new Set(layerIds).size, layerIds.length);
	let cursor = 0;
	for (const scene of movie.scenes) {
		assert.equal(scene.start, cursor);
		cursor += scene.duration;
	}
	assert.equal(movie.duration, cursor);
});

test('scene shortening keeps every keyframe inside its layer and preserves cut values', () => {
	const movie = structuredClone(createStudioShowcaseMovie());
	const scene = movie.scenes.find(item => (item.layers || []).some(layer => {
		return (layer.keyframes || []).some(frame => Number(frame.at) > 7);
	}));
	assert.ok(scene);
	const affected = scene.layers.filter(layer => {
		return (layer.keyframes || []).some(frame => Number(frame.at) > 7);
	});
	resizeStudioScene(movie, scene.id, 7);
	for (const layer of scene.layers) {
		for (const frame of layer.keyframes || []) {
			assert.ok(Number(frame.at) <= Number(layer.duration) + 0.000001);
		}
	}
	for (const layer of affected) {
		const trimmed = scene.layers.find(item => item.id === layer.id);
		assert.ok((trimmed.keyframes || []).some(frame => {
			return Math.abs(Number(frame.at) - Number(trimmed.duration)) < 0.000001;
		}));
	}
});

test('shared Studio movie history restores complete canonical revisions', () => {
	const base = createStudioShowcaseMovie();
	const edited = structuredClone(base);
	addStudioScene(edited, edited.scenes[0].id);
	const history = new StudioMovieHistory(base);
	const recorded = history.record(edited, 'Add a scene');
	assert.equal(recorded.scenes.length, base.scenes.length + 1);
	assert.equal(history.canUndo(), true);
	assert.equal(history.undo().scenes.length, base.scenes.length);
	assert.equal(history.canRedo(), true);
	assert.equal(history.redo().scenes.length, edited.scenes.length);
});

test('project storage round-trips canonical movie JSON and recovery', () => {
	const storage = new StudioProjectStorage(memoryStorage());
	const movie = createStudioShowcaseMovie();
	const saved = storage.save(movie, { title: 'Persistent Movie' });
	const opened = storage.load(saved.id);
	assert.deepEqual(opened, movie);
	assert.equal(storage.list()[0].id, saved.id);
	assert.equal(storage.saveRecovery(movie), true);
	assert.equal(storage.hasRecovery(), true);
	assert.deepEqual(storage.loadRecovery(), movie);
});
