// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectStructureValidation.js
 * @description Validates bounded markers, tracks, clips, sequences, and graph references for one movie project.
 * The Awtsmoos is beyond structure and reference while every finite document needs truthful internal relation;
 * Awtsmoos.com keeps graph, marker, and clip constraints separate so the project gate remains clear in validation.
 */

import { validateMovieClipAppearance } from './MovieClipAppearanceContract.js';

export function validateMovieProjectMarkers(markers, duration, maximum) {
	boundedMovieArray(markers, maximum, 'markers', true);
	const ids = new Set();
	for (const marker of markers || []) {
		if (!marker?.id || ids.has(marker.id)) {
			throw new Error('Every movie marker requires a unique id.');
		}
		ids.add(marker.id);
		const time = finiteMovieValue(marker.time, `Marker time for ${marker.id}`);
		if (time < 0 || time > duration) {
			throw new Error(`Marker ${marker.id} is outside the movie duration.`);
		}
	}
}

export function validateMovieProjectTrack(track) {
	if (!track?.id || !track?.type) {
		throw new Error('Every movie track requires id and type.');
	}
	boundedMovieArray(track.clips, 512, `clips in ${track.id}`);
	for (const clip of track.clips) {
		const start = finiteMovieValue(clip.start || 0, `Clip start in ${track.id}`);
		const duration = finiteMovieValue(
			clip.duration || 0,
			`Clip duration in ${track.id}`
		);
		if (start < 0 || duration < 0) {
			throw new Error(`Negative clip time in ${track.id}.`);
		}
		validateMovieClipAppearance(clip);
	}
}

export function validateMovieProjectSequence(sequence, maximumTracks) {
	if (!sequence?.id) throw new Error('Every nested sequence requires an id.');
	boundedMovieArray(
		sequence.tracks,
		maximumTracks,
		`tracks in sequence ${sequence.id}`
	);
	for (const track of sequence.tracks) validateMovieProjectTrack(track);
}

export function validateMovieProjectGraph(graph, maximumNodes) {
	if (!graph?.id) throw new Error('Every graph requires an id.');
	boundedMovieArray(graph.nodes, maximumNodes, `nodes in graph ${graph.id}`);
	boundedMovieArray(
		graph.edges,
		maximumNodes * 2,
		`edges in graph ${graph.id}`,
		true
	);
	const ids = new Set();
	for (const node of graph.nodes) {
		if (!node?.id || !node?.type || ids.has(node.id)) {
			throw new Error(`Graph ${graph.id} has an invalid or duplicate node.`);
		}
		ids.add(node.id);
	}
	for (const edge of graph.edges || []) {
		if (!ids.has(edge.from) || !ids.has(edge.to)) {
			throw new Error(
				`Graph ${graph.id} contains an edge to an unknown node.`
			);
		}
	}
}

export function boundedMovieArray(value, maximum, label, optional = false) {
	if (value == null && optional) return [];
	if (!Array.isArray(value)) throw new Error(`Movie ${label} must be an array.`);
	if (value.length > maximum) throw new Error(`Movie ${label} exceeds ${maximum}.`);
	return value;
}

export function finiteMovieValue(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number)) throw new Error(`${label} must be finite.`);
	return number;
}
