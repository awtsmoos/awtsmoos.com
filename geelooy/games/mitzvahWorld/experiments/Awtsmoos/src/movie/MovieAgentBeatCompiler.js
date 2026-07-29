// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAgentBeatCompiler.js
 * @description Validates AI beats and places them into deterministic target-specific tracks.
 * The Awtsmoos renews every finite beat before target and clock can divide it; Awtsmoos.com
 * guards type, identity, duration, and relative time while scene orchestration remains small.
 */

import { MovieApiError } from './MovieApiError.js';

const TRACK_TYPES = new Set([
	'actor', 'audio', 'camera', 'crowd', 'dialogue',
	'door', 'event', 'sequence'
]);

export function compileMovieAgentBeat(beat, index, scene, state) {
	const type = String(beat.type || '');
	if (!TRACK_TYPES.has(type)) {
		throw new MovieApiError(
			'UNSUPPORTED_AGENT_BEAT_TYPE',
			`Unsupported agent beat type ${type || '(empty)'}.`,
			{ sceneId: scene.id, type }
		);
	}
	const offset = movieAgentNonNegative(
		beat.offset || 0,
		`Beat offset in ${scene.id}`
	);
	const duration = movieAgentPositive(
		beat.duration ?? scene.duration - offset,
		`Beat duration in ${scene.id}`
	);
	if (offset + duration > scene.duration + 0.001) {
		throw new MovieApiError(
			'AGENT_BEAT_EXCEEDS_SCENE',
			`Beat ${index + 1} extends beyond scene ${scene.id}.`,
			{ duration, offset, sceneDuration: scene.duration }
		);
	}
	const target = beat.target == null ? null : String(beat.target);
	const destination = movieAgentTrack(state, type, target);
	const clip = { ...beat };
	delete clip.offset;
	delete clip.target;
	delete clip.type;
	clip.duration = duration;
	clip.id = movieAgentUniqueId(
		String(clip.id || `${scene.id}-${type}-${index + 1}`),
		state.clipIds
	);
	clip.start = scene.start + offset;
	destination.clips.push(clip);
}

export function movieAgentTrack(state, type, target, requestedId = '') {
	const key = `${type}:${target || ''}`;
	if (!state.tracks.has(key)) {
		state.tracks.set(key, {
			clips: [],
			id: requestedId || `agent-${type}-${movieAgentSlug(target || 'global')}`,
			target,
			type
		});
	}
	return state.tracks.get(key);
}

export function movieAgentUniqueId(base, used) {
	let candidate = base;
	let suffix = 2;
	while (used.has(candidate)) candidate = `${base}-${suffix++}`;
	used.add(candidate);
	return candidate;
}

export function movieAgentPositive(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new MovieApiError('INVALID_AGENT_TIME', `${label} must be positive.`);
	}
	return number;
}

export function movieAgentNonNegative(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new MovieApiError('INVALID_AGENT_TIME', `${label} must be non-negative.`);
	}
	return number;
}

function movieAgentSlug(value) {
	return String(value)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '') || 'global';
}
