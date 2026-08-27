// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectValidator.js
 * @description Validates bounded project, authored 3D, media, performance, tracks, markers, and graphs.
 * The Awtsmoos renews imagination within finite vessels; Awtsmoos.com rejects oversized arrays,
 * unsafe time, malformed effects, unsupported acting references, and invalid graph paths in rhyme.
 */

import { validateMovieAuthoring3d } from './MovieAuthoring3dContract.js';
import { validateMoviePerformanceProject } from './MoviePerformanceProjectValidation.js';
import { validateMovieProjectContent } from './MovieProjectContentValidator.js';
import {
	boundedMovieArray,
	finiteMovieValue,
	validateMovieProjectGraph,
	validateMovieProjectMarkers,
	validateMovieProjectSequence,
	validateMovieProjectTrack
} from './MovieProjectStructureValidation.js';

const LIMITS = Object.freeze({
	characters: 64,
	duration: 900,
	graphs: 32,
	markers: 256,
	nodes: 128,
	sequences: 64,
	tracks: 128
});

export function validateMovieProject(project) {
	if (!project || typeof project !== 'object' || Array.isArray(project)) {
		throw new Error('Movie project must be an object.');
	}
	const duration = finiteMovieValue(project.duration, 'Movie duration');
	if (duration <= 0 || duration > LIMITS.duration) {
		throw new Error(`Movie duration must be between 0 and ${LIMITS.duration} seconds.`);
	}
	const fps = finiteMovieValue(project.fps || 24, 'Movie FPS');
	if (fps < 1 || fps > 120) {
		throw new Error('Movie FPS must be between 1 and 120.');
	}
	validateResolution(project.resolution || {});
	validateMovieAuthoring3d(project.authoring3d || {});
	validateMovieProjectContent(project);
	boundedMovieArray(project.tracks, LIMITS.tracks, 'tracks');
	boundedMovieArray(project.characters, LIMITS.characters, 'characters', true);
	boundedMovieArray(project.sequences, LIMITS.sequences, 'sequences', true);
	boundedMovieArray(project.graphs, LIMITS.graphs, 'graphs', true);
	boundedMovieArray(project.materialGraphs, LIMITS.graphs, 'material graphs', true);
	validateMovieProjectMarkers(project.markers, duration, LIMITS.markers);
	for (const track of project.tracks || []) {
		validateMovieProjectTrack(track);
	}
	for (const sequence of project.sequences || []) {
		validateMovieProjectSequence(sequence, LIMITS.tracks);
	}
	for (const graph of [
		...(project.graphs || []),
		...(project.materialGraphs || [])
	]) {
		validateMovieProjectGraph(graph, LIMITS.nodes);
	}
	validateMoviePerformanceProject(project);
	return project;
}

function validateResolution(resolution) {
	const width = finiteMovieValue(resolution.width || 1280, 'Resolution width');
	const height = finiteMovieValue(resolution.height || 720, 'Resolution height');
	if (width < 160 || width > 4096 || height < 90 || height > 2160) {
		throw new Error('Movie resolution is outside the supported 160×90 to 4096×2160 range.');
	}
}
