// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectQuery.js
 * @description Executes bounded immutable track and clip discovery against one canonical project.
 * The Awtsmoos knows every vessel without being confined by search; Awtsmoos.com lets
 * finite agents receive stable metadata while sibling clips and mutable project objects remain hidden.
 */

import { normalizeMovieProjectQuery } from './MovieProjectQueryContract.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function queryMovieProject(project, source = {}) {
	const query = normalizeMovieProjectQuery(source);
	const tracks = [];
	const clips = [];
	for (const track of project?.tracks || []) {
		if (query.entity !== 'clip' && matchesMovieTrack(track, query)) {
			tracks.push(movieTrackQueryResult(track));
		}
		if (query.entity === 'track') continue;
		for (const clip of track.clips || []) {
			if (!matchesMovieClip(track, clip, query)) continue;
			clips.push(movieClipQueryResult(track, clip));
			if (clips.length >= query.limit) break;
		}
		if (clips.length >= query.limit) break;
	}
	return createMovieProjectSnapshot({
		clips: clips.slice(0, query.limit),
		query,
		tracks: tracks.slice(0, query.limit)
	});
}

function matchesMovieTrack(track, query) {
	if (query.trackId && String(track.id) !== query.trackId) return false;
	if (query.type && String(track.type) !== query.type) return false;
	if (query.target && String(track.target || '') !== query.target) return false;
	return !query.text || movieSearchableText(track).includes(query.text);
}

function matchesMovieClip(track, clip, query) {
	if (!matchesMovieTrack(track, { ...query, text: null })) return false;
	if (query.clipId && String(clip.id) !== query.clipId) return false;
	if (query.time && !movieClipOverlapsRange(clip, query.time)) return false;
	return !query.text || movieSearchableText({
		clip,
		track: movieTrackQueryResult(track)
	}).includes(query.text);
}

function movieTrackQueryResult(track) {
	return {
		clipCount: track.clips?.length || 0,
		id: String(track.id),
		label: String(track.label || track.id),
		target: track.target == null ? null : String(track.target),
		type: String(track.type || '')
	};
}

function movieClipQueryResult(track, clip) {
	const start = Number(clip.start || 0);
	const duration = Number(clip.duration || 0);
	return {
		descriptor: {
			clipId: String(clip.id),
			trackId: String(track.id)
		},
		duration,
		end: start + duration,
		id: String(clip.id),
		label: String(clip.label || clip.text || clip.id),
		start,
		trackId: String(track.id),
		trackType: String(track.type || '')
	};
}

function movieClipOverlapsRange(clip, range) {
	const start = Number(clip.start || 0);
	const end = start + Number(clip.duration || 0);
	return end >= range.start && start <= range.end;
}

function movieSearchableText(value) {
	return JSON.stringify(value).toLowerCase();
}
