// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTitleCommands.js
 * @description Applies immutable add, update, and remove operations to title and lower-third tracks.
 * The Awtsmoos is beyond title and name while every finite card deserves one stable timeline identity;
 * Awtsmoos.com keeps readable style, subtitle, placement, timing, and undo inside ordinary project reality.
 */

import { MovieApiError } from './MovieApiError.js';
import { normalizeMovieTitleClip } from './MovieTextTrackContract.js';
import { cloneMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const TITLE_COMMANDS = new Set(['addTitle', 'removeTitle', 'updateTitle']);

export function executeMovieTitleCommand(project, name, payload = {}) {
	if (!TITLE_COMMANDS.has(name)) return null;
	const next = cloneMovieProjectSnapshot(project);
	const track = ensureTitleTrack(next, payload.trackId);
	if (name === 'addTitle') return addTitle(next, track, payload.title);
	if (name === 'updateTitle') return updateTitle(next, track, payload);
	return removeTitle(next, track, payload.titleId);
}

function addTitle(project, track, source) {
	const clip = normalizeMovieTitleClip({
		...source,
		id: source?.id || uniqueTitleId(track)
	});
	if (track.clips.some(value => value.id === clip.id)) {
		throw new MovieApiError('DUPLICATE_MOVIE_TITLE_ID', `Title ${clip.id} already exists.`);
	}
	track.clips.push(clip);
	sortClips(track);
	return result(project, 'Add title', track, clip.id);
}

function updateTitle(project, track, payload) {
	const clip = requireTitle(track, payload.titleId);
	const updated = normalizeMovieTitleClip({
		...clip,
		...(payload.patch || {}),
		id: clip.id
	});
	track.clips = track.clips.map(value => value.id === clip.id ? updated : value);
	sortClips(track);
	return result(project, 'Update title', track, clip.id);
}

function removeTitle(project, track, titleId) {
	const clip = requireTitle(track, titleId);
	track.clips = track.clips.filter(value => value.id !== clip.id);
	return result(project, 'Remove title', track, clip.id);
}

function ensureTitleTrack(project, requestedId) {
	const id = String(requestedId || 'titles');
	let track = (project.tracks || []).find(value => value.id === id);
	if (!track) {
		track = { clips: [], id, type: 'title' };
		project.tracks.push(track);
	}
	if (track.type !== 'title') {
		throw new MovieApiError('MOVIE_TITLE_TRACK_REQUIRED', `Track ${id} is not a title track.`);
	}
	track.clips ||= [];
	return track;
}

function requireTitle(track, id) {
	const clip = track.clips.find(value => value.id === String(id || ''));
	if (!clip) throw new MovieApiError('MOVIE_TITLE_NOT_FOUND', `Title ${id || '(empty)'} was not found.`);
	return clip;
}

function uniqueTitleId(track) {
	let index = track.clips.length + 1;
	let id = `title-${index}`;
	while (track.clips.some(value => value.id === id)) id = `title-${++index}`;
	return id;
}

function sortClips(track) {
	track.clips.sort((left, right) => left.start - right.start || left.id.localeCompare(right.id));
}

function result(project, label, track, clipId) {
	return { detail: { clipId, trackId: track.id }, label, project, selection: null };
}
