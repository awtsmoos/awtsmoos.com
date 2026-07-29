// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCaptionCommands.js
 * @description Applies immutable add, update, remove, and SRT/WebVTT import operations to caption tracks.
 * The Awtsmoos is beyond speaker and subtitle while each finite line must enter history through one stable gate;
 * Awtsmoos.com preserves timing, language, style, identity, and portable text without mutating another state.
 */

import { parseMovieCaptions } from './MovieCaptionCodec.js';
import { MovieApiError } from './MovieApiError.js';
import { normalizeMovieCaptionClip } from './MovieTextTrackContract.js';
import { cloneMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const CAPTION_COMMANDS = new Set([
	'addCaption',
	'importCaptions',
	'removeCaption',
	'updateCaption'
]);

export function executeMovieCaptionCommand(project, name, payload = {}) {
	if (!CAPTION_COMMANDS.has(name)) return null;
	const next = cloneMovieProjectSnapshot(project);
	const track = ensureCaptionTrack(next, payload.trackId, payload.language);
	if (name === 'addCaption') return addCaption(next, track, payload.caption);
	if (name === 'updateCaption') return updateCaption(next, track, payload);
	if (name === 'removeCaption') return removeCaption(next, track, payload.captionId);
	return importCaptions(next, track, payload);
}

function addCaption(project, track, source) {
	const clip = normalizeMovieCaptionClip({
		...source,
		id: source?.id || uniqueCaptionId(track)
	});
	if (track.clips.some(value => value.id === clip.id)) {
		throw new MovieApiError('DUPLICATE_MOVIE_CAPTION_ID', `Caption ${clip.id} already exists.`);
	}
	track.clips.push(clip);
	sortClips(track);
	return result(project, 'Add caption', track, [clip.id]);
}

function updateCaption(project, track, payload) {
	const clip = requireCaption(track, payload.captionId);
	const updated = normalizeMovieCaptionClip({
		...clip,
		...(payload.patch || {}),
		id: clip.id
	});
	track.clips = track.clips.map(value => value.id === clip.id ? updated : value);
	sortClips(track);
	return result(project, 'Update caption', track, [clip.id]);
}

function removeCaption(project, track, captionId) {
	const clip = requireCaption(track, captionId);
	track.clips = track.clips.filter(value => value.id !== clip.id);
	return result(project, 'Remove caption', track, [clip.id]);
}

function importCaptions(project, track, payload) {
	const clips = parseMovieCaptions(payload.text, {
		format: payload.format,
		language: payload.language || track.language,
		position: payload.position,
		speaker: payload.speaker,
		style: payload.style
	}).map((clip, index) => ({
		...clip,
		id: payload.replace === false ? uniqueCaptionId(track, index) : clip.id
	}));
	track.clips = payload.replace === false ? [...track.clips, ...clips] : clips;
	track.language = String(payload.language || track.language || 'en');
	sortClips(track);
	return result(project, 'Import captions', track, clips.map(clip => clip.id));
}

function ensureCaptionTrack(project, requestedId, language) {
	const id = String(requestedId || 'captions');
	let track = (project.tracks || []).find(value => value.id === id);
	if (!track) {
		track = { clips: [], id, language: String(language || 'en'), type: 'caption' };
		project.tracks.push(track);
	}
	if (track.type !== 'caption') {
		throw new MovieApiError('MOVIE_CAPTION_TRACK_REQUIRED', `Track ${id} is not a caption track.`);
	}
	track.clips ||= [];
	return track;
}

function requireCaption(track, id) {
	const clip = track.clips.find(value => value.id === String(id || ''));
	if (!clip) throw new MovieApiError('MOVIE_CAPTION_NOT_FOUND', `Caption ${id || '(empty)'} was not found.`);
	return clip;
}

function uniqueCaptionId(track, offset = 0) {
	let index = track.clips.length + offset + 1;
	let id = `caption-${index}`;
	while (track.clips.some(value => value.id === id)) id = `caption-${++index}`;
	return id;
}

function sortClips(track) {
	track.clips.sort((left, right) => left.start - right.start || left.id.localeCompare(right.id));
}

function result(project, label, track, clipIds) {
	return { detail: { clipIds, trackId: track.id }, label, project, selection: null };
}
