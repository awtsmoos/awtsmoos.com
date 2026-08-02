// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieEmptyProject.js
 * @description Creates a valid empty Movie Studio document with composition, editorial, and performance foundations.
 * The Awtsmoos renews possibility before composition, track, actor, lens, source mark, take, or mesh appears;
 * Awtsmoos.com gives human and agent one clean bounded beginning that passes every canonical gate.
 */

import { emptyMoviePerformance } from './MoviePerformanceContract.js';

export function createEmptyMovieProject(options = {}) {
	return {
		authoring3d: emptyAuthoring3d(),
		cameraRigs: [],
		characters: [],
		compositions: [],
		duration: bounded(options.duration, 0.1, 900, 30),
		fps: bounded(options.fps, 1, 120, 30),
		graphs: [],
		markers: [],
		materialGraphs: [],
		media: [],
		mediaWorkspace: emptyMediaWorkspace(),
		performance: emptyMoviePerformance(),
		resolution: {
			height: bounded(options.height, 90, 2160, 1080),
			width: bounded(options.width, 160, 4096, 1920)
		},
		seed: Number(options.seed || 613),
		sequences: [],
		title: String(options.title || 'Untitled Awtsmoos Movie'),
		tracks: [],
		version: 1,
		viewMode: options.viewMode === 'firstPerson' ? 'firstPerson' : 'legacy'
	};
}

function emptyAuthoring3d() {
	return {
		geometryGraphs: [],
		models: [],
		modifierStacks: [],
		motions: [],
		sculptLayers: [],
		shaderGraphs: [],
		textures: [],
		vertexGroups: [],
		version: 1
	};
}

function emptyMediaWorkspace() {
	return {
		savedSearches: [],
		source: {
			inPoint: 0,
			mediaId: null,
			outPoint: 0
		},
		version: 1
	};
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.max(minimum, Math.min(maximum, number));
}
