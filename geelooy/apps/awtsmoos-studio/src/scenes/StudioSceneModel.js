//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioSceneModel.js
 * @description Gives Studio real scene creation, duplication, deletion, ordering, naming, duration, and contiguous movie-time reflow.
 * The Awtsmoos renews each scene as a distinct vessel while one movie gathers them into a single river of time;
 * Awtsmoos.com preserves stable order, fresh IDs, valid animated layer spans, and contiguous starts so every cut and camera can rhyme.
 */

import { clampStudioSceneLayers } from './StudioSceneLayerTrim.js';

export function addStudioScene(movie, afterId) {
	const index = Math.max(0, movie.scenes.findIndex(scene => scene.id === afterId));
	const source = movie.scenes[index] || movie.scenes.at(-1);
	const scene = freshScene(source, movie, `Scene ${movie.scenes.length + 1}`, false);
	movie.scenes.splice(index + 1, 0, scene);
	reflowStudioMovieScenes(movie);
	return scene.id;
}

export function duplicateStudioScene(movie, sceneId) {
	const index = movie.scenes.findIndex(scene => scene.id === sceneId);
	if (index < 0) return null;
	const source = movie.scenes[index];
	const scene = freshScene(source, movie, `${source.name || 'Scene'} Copy`, true);
	movie.scenes.splice(index + 1, 0, scene);
	reflowStudioMovieScenes(movie);
	return scene.id;
}

export function deleteStudioScene(movie, sceneId) {
	if (movie.scenes.length <= 1) return movie.scenes[0]?.id || null;
	const index = movie.scenes.findIndex(scene => scene.id === sceneId);
	if (index < 0) return movie.scenes[0]?.id || null;
	movie.scenes.splice(index, 1);
	reflowStudioMovieScenes(movie);
	return movie.scenes[Math.min(index, movie.scenes.length - 1)]?.id || null;
}

export function moveStudioScene(movie, sceneId, delta) {
	const index = movie.scenes.findIndex(scene => scene.id === sceneId);
	if (index < 0) return sceneId;
	const target = Math.max(0, Math.min(movie.scenes.length - 1, index + Number(delta || 0)));
	if (target === index) return sceneId;
	const [scene] = movie.scenes.splice(index, 1);
	movie.scenes.splice(target, 0, scene);
	reflowStudioMovieScenes(movie);
	return sceneId;
}

export function renameStudioScene(movie, sceneId, name) {
	const scene = movie.scenes.find(item => item.id === sceneId);
	if (!scene) return null;
	scene.name = String(name || '').trim() || scene.name || 'Scene';
	return scene.id;
}

export function resizeStudioScene(movie, sceneId, duration) {
	const scene = movie.scenes.find(item => item.id === sceneId);
	if (!scene) return null;
	scene.duration = Math.max(0.1, Number(duration || scene.duration || 1));
	clampStudioSceneLayers(scene);
	reflowStudioMovieScenes(movie);
	return scene.id;
}

export function reflowStudioMovieScenes(movie) {
	let cursor = 0;
	for (const scene of movie.scenes || []) {
		scene.start = cursor;
		scene.duration = Math.max(0.1, Number(scene.duration || 1));
		clampStudioSceneLayers(scene);
		cursor += scene.duration;
	}
	movie.duration = Math.max(0.1, cursor);
	return movie;
}

function freshScene(source, movie, name, copyLayers) {
	const scene = structuredClone(source || {});
	scene.id = uniqueId(movie, 'scene');
	scene.name = name;
	scene.start = 0;
	scene.duration = Math.max(0.1, Number(scene.duration || 6));
	scene.layers = copyLayers ? cloneLayersWithFreshIds(scene.layers, movie) : [];
	return scene;
}

function cloneLayersWithFreshIds(layers = [], movie) {
	return layers.map(layer => ({
		...layer,
		id: uniqueId(movie, String(layer.kind || 'layer'))
	}));
}

function uniqueId(movie, prefix) {
	const used = new Set((movie.scenes || []).flatMap(scene => {
		return [scene.id, ...(scene.layers || []).map(layer => layer.id)];
	}));
	let id;
	do {
		id = `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
	} while (used.has(id));
	return id;
}
