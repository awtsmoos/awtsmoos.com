// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSourceEditContext.js
 * @description Resolves marked source media, timeline time, compatible track, and clip identity.
 * The Awtsmoos joins source and sequence without confusion or collision; Awtsmoos.com
 * gives every professional edit a bounded context, stable vessel, and truthful decision.
 */

import { uniqueMovieClipId } from './MovieClipCommands.js';
import { resolveMovieSourceRange } from './MovieMediaWorkspaceContract.js';
import { cloneMovieSourceEditProject } from './MovieSourceEditProjectClone.js';

const EDITABLE_MEDIA_KINDS = new Set(['audio', 'image', 'video']);

export function createMovieSourceEditContext(projectSource, payload = {}) {
	const project = cloneMovieSourceEditProject(projectSource);
	const range = resolveMovieSourceRange(project);
	assertEditableMedia(range.media);
	const time = timelineTime(payload.time);
	const sourceDuration = range.duration;
	const duration = sourceDuration > 0
		? sourceDuration
		: stillDuration(range.media, payload.duration);
	if (!(duration > 0)) {
		throw new Error('Source in/out points must define a positive duration.');
	}
	const track = resolveCompatibleTrack(project, range.media, payload.trackId);
	const clip = {
		duration: round(duration),
		id: uniqueMovieClipId(project, `${range.media.id}-edit`),
		label: String(payload.label || range.media.label),
		mediaId: range.media.id,
		sourceMediaId: range.media.id,
		sourceOffset: round(range.inPoint),
		start: time
	};
	return {
		clip,
		duration: clip.duration,
		end: round(time + clip.duration),
		project,
		track
	};
}

export function uniqueMovieTrackId(project, base) {
	const ids = new Set((project.tracks || []).map(track => track.id));
	let candidate = String(base || 'media-track');
	let suffix = 2;
	while (ids.has(candidate)) {
		candidate = `${base}-${suffix}`;
		suffix += 1;
	}
	return candidate;
}

function assertEditableMedia(media) {
	if (!EDITABLE_MEDIA_KINDS.has(media.kind)) {
		throw new Error(`Media kind ${media.kind} cannot be inserted into the timeline.`);
	}
}

function timelineTime(value) {
	const number = Number(value ?? 0);
	if (!Number.isFinite(number)) {
		throw new Error('Timeline edit time must be a finite number.');
	}
	return round(Math.max(0, number));
}

function resolveCompatibleTrack(project, media, trackId) {
	const expectedType = media.kind === 'audio' ? 'audio' : 'video';
	if (trackId) {
		const track = project.tracks.find(item => item.id === String(trackId));
		if (!track) {
			throw new Error(`Unknown movie track: ${trackId}`);
		}
		if (track.type !== expectedType) {
			throw new Error(`${media.kind} media requires a ${expectedType} track.`);
		}
		return track;
	}
	const existing = project.tracks.find(track => track.type === expectedType);
	if (existing) {
		return existing;
	}
	const track = {
		clips: [],
		id: uniqueMovieTrackId(project, `${expectedType}-media`),
		label: expectedType === 'audio' ? 'Audio Media' : 'Video Media',
		target: null,
		type: expectedType
	};
	project.tracks.push(track);
	return track;
}

function stillDuration(media, value) {
	if (media.kind !== 'image') {
		return 0;
	}
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 5;
}

function round(value) {
	return Number(Number(value).toFixed(3));
}
