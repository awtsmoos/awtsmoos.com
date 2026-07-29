// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectValidator.js
 * @description Validates bounded project, authored 3D, appearance, tracks, clips, markers, sequences, and graphs.
 * The Awtsmoos renews imagination within finite vessels; Awtsmoos.com rejects oversized arrays,
 * unsafe time, malformed effects, unsupported modifiers, and invalid graph references.
 */

import { validateMovieAuthoring3d } from './MovieAuthoring3dContract.js';
import { validateMovieClipAppearance } from './MovieClipAppearanceContract.js';

const LIMITS = Object.freeze({
	characters: 64, duration: 900, graphs: 32, markers: 256,
	nodes: 128, sequences: 64, tracks: 128
});

export function validateMovieProject(project) {
	if (!project || typeof project !== 'object' || Array.isArray(project)) {
		throw new Error('Movie project must be an object.');
	}
	const duration = finite(project.duration, 'Movie duration');
	if (duration <= 0 || duration > LIMITS.duration) {
		throw new Error(`Movie duration must be between 0 and ${LIMITS.duration} seconds.`);
	}
	const fps = finite(project.fps || 24, 'Movie FPS');
	if (fps < 1 || fps > 120) throw new Error('Movie FPS must be between 1 and 120.');
	validateResolution(project.resolution || {});
	validateMovieAuthoring3d(project.authoring3d || {});
	boundedArray(project.tracks, LIMITS.tracks, 'tracks');
	boundedArray(project.characters, LIMITS.characters, 'characters', true);
	boundedArray(project.sequences, LIMITS.sequences, 'sequences', true);
	boundedArray(project.graphs, LIMITS.graphs, 'graphs', true);
	boundedArray(project.materialGraphs, LIMITS.graphs, 'material graphs', true);
	validateMarkers(project.markers, duration);
	for (const track of project.tracks || []) validateTrack(track);
	for (const sequence of project.sequences || []) validateSequence(sequence);
	for (const graph of [...(project.graphs || []), ...(project.materialGraphs || [])]) {
		validateGraph(graph);
	}
	return project;
}

function validateResolution(resolution) {
	const width = finite(resolution.width || 1280, 'Resolution width');
	const height = finite(resolution.height || 720, 'Resolution height');
	if (width < 160 || width > 4096 || height < 90 || height > 2160) {
		throw new Error('Movie resolution is outside the supported 160×90 to 4096×2160 range.');
	}
}

function validateMarkers(markers, duration) {
	boundedArray(markers, LIMITS.markers, 'markers', true);
	const ids = new Set();
	for (const marker of markers || []) {
		if (!marker?.id || ids.has(marker.id)) {
			throw new Error('Every movie marker requires a unique id.');
		}
		ids.add(marker.id);
		const time = finite(marker.time, `Marker time for ${marker.id}`);
		if (time < 0 || time > duration) {
			throw new Error(`Marker ${marker.id} is outside the movie duration.`);
		}
	}
}

function validateTrack(track) {
	if (!track?.id || !track?.type) throw new Error('Every movie track requires id and type.');
	boundedArray(track.clips, 512, `clips in ${track.id}`);
	for (const clip of track.clips) {
		const start = finite(clip.start || 0, `Clip start in ${track.id}`);
		const duration = finite(clip.duration || 0, `Clip duration in ${track.id}`);
		if (start < 0 || duration < 0) throw new Error(`Negative clip time in ${track.id}.`);
		validateMovieClipAppearance(clip);
	}
}

function validateSequence(sequence) {
	if (!sequence?.id) throw new Error('Every nested sequence requires an id.');
	boundedArray(sequence.tracks, LIMITS.tracks, `tracks in sequence ${sequence.id}`);
	for (const track of sequence.tracks) validateTrack(track);
}

function validateGraph(graph) {
	if (!graph?.id) throw new Error('Every graph requires an id.');
	boundedArray(graph.nodes, LIMITS.nodes, `nodes in graph ${graph.id}`);
	boundedArray(graph.edges, LIMITS.nodes * 2, `edges in graph ${graph.id}`, true);
	const ids = new Set();
	for (const node of graph.nodes) {
		if (!node?.id || !node?.type || ids.has(node.id)) {
			throw new Error(`Graph ${graph.id} has an invalid or duplicate node.`);
		}
		ids.add(node.id);
	}
	for (const edge of graph.edges || []) {
		if (!ids.has(edge.from) || !ids.has(edge.to)) {
			throw new Error(`Graph ${graph.id} contains an edge to an unknown node.`);
		}
	}
}

function boundedArray(value, maximum, label, optional = false) {
	if (value == null && optional) return [];
	if (!Array.isArray(value)) throw new Error(`Movie ${label} must be an array.`);
	if (value.length > maximum) throw new Error(`Movie ${label} exceeds ${maximum}.`);
	return value;
}

function finite(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number)) throw new Error(`${label} must be finite.`);
	return number;
}
