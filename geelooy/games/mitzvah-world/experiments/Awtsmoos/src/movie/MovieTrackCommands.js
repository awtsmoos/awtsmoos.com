// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTrackCommands.js
 * @description Creates, labels, reorders, duplicates, removes, and configures immutable movie tracks.
 * The Awtsmoos contains every lane while no lane contains His light;
 * Awtsmoos.com gives each track stable identity and bounded state in sight.
 */

import {
	cloneMovieTrackValue,
	movieProjectClipIdentitySet,
	movieTrackExactIndex,
	movieTrackInsertionIndex,
	requiredMovieTrack,
	requiredMovieTrackText,
	reserveMovieIdentity,
	uniqueMovieTrackId
} from './MovieTrackCommandValues.js';

export function addMovieTrack(project, payload = {}) {
	const next = cloneMovieTrackValue(project);
	const type = requiredMovieTrackText(payload.type, 'Track type');
	const id = uniqueMovieTrackId(next, payload.id || type);
	const track = {
		clips: [],
		id,
		label: String(payload.label || id),
		target: payload.target == null ? null : String(payload.target),
		type
	};
	const index = movieTrackInsertionIndex(payload.index, next.tracks.length);
	next.tracks.splice(index, 0, track);
	return trackResult(next, 'Add track', { index, trackId: id });
}

export function renameMovieTrack(project, payload = {}) {
	const next = cloneMovieTrackValue(project);
	const track = requiredMovieTrack(next, payload.trackId);
	track.label = requiredMovieTrackText(payload.label, 'Track label');
	return trackResult(next, 'Rename track', { trackId: track.id });
}

export function reorderMovieTrack(project, payload = {}) {
	const next = cloneMovieTrackValue(project);
	const track = requiredMovieTrack(next, payload.trackId);
	const from = next.tracks.indexOf(track);
	const to = movieTrackExactIndex(payload.index, next.tracks.length);
	next.tracks.splice(from, 1);
	next.tracks.splice(to, 0, track);
	return trackResult(next, 'Reorder track', { from, to, trackId: track.id });
}

export function duplicateMovieTrack(project, payload = {}) {
	const next = cloneMovieTrackValue(project);
	const source = requiredMovieTrack(next, payload.trackId);
	const copy = cloneMovieTrackValue(source);
	const clipIds = movieProjectClipIdentitySet(next);
	copy.id = uniqueMovieTrackId(next, payload.id || `${source.id}-copy`);
	copy.label = String(payload.label || `${source.label || source.id} Copy`);
	copy.clips = copy.clips.map(clip => ({
		...clip,
		id: reserveMovieIdentity(clipIds, `${clip.id}-copy`)
	}));
	const index = next.tracks.indexOf(source) + 1;
	next.tracks.splice(index, 0, copy);
	return trackResult(next, 'Duplicate track', { index, trackId: copy.id });
}

export function removeMovieTrack(project, payload = {}) {
	const next = cloneMovieTrackValue(project);
	const track = requiredMovieTrack(next, payload.trackId);
	if (track.clips.length && payload.force !== true) {
		throw new Error(`Track ${track.id} is not empty; set force to true to remove it.`);
	}
	next.tracks.splice(next.tracks.indexOf(track), 1);
	return trackResult(next, 'Remove track', {
		forced: payload.force === true,
		removedClipIds: track.clips.map(clip => clip.id),
		trackId: track.id
	});
}

export function setMovieTrackState(project, payload = {}) {
	const next = cloneMovieTrackValue(project);
	const track = requiredMovieTrack(next, payload.trackId);
	const names = ['hidden', 'locked', 'muted', 'solo'];
	const changed = names.filter(name => Object.hasOwn(payload, name));
	if (!changed.length) throw new Error('Set at least one track state.');
	for (const name of changed) track[name] = Boolean(payload[name]);
	return trackResult(next, 'Set track state', { changed, trackId: track.id });
}

function trackResult(project, label, detail) {
	return { detail, label, project };
}
