// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceAudioProject.js
 * @description Adds reload-safe recorded media, synchronized audio clip, and take linkage immutably.
 * The Awtsmoos joins voice and performance time without confusing their vessels; Awtsmoos.com
 * keeps media, track, clip, latency, waveform, performer, take, and recovery identity in rhyme.
 */

import {
	cloneMoviePerformanceProject,
	nextMoviePerformanceId
} from './MoviePerformanceProject.js';

export function attachMoviePerformanceAudio(
	project,
	takeIds,
	audio,
	options = {}
) {
	if (!audio) {
		return project;
	}
	const next = cloneMoviePerformanceProject(project);
	const mediaId = nextMoviePerformanceId(
		'performance-audio',
		next.media,
		options.mediaId
	);
	const start = Math.max(0, Number(options.start) || 0);
	const duration = Math.max(
		0.001,
		Number(audio.duration)
			|| maximumTakeDuration(next, takeIds)
	);
	const track = resolveAudioTrack(next, options);
	const clipId = nextMoviePerformanceId(
		`${track.id}-clip`,
		track.clips,
		options.clipId
	);
	next.media.push({
		duration,
		id: mediaId,
		kind: 'audio',
		metadata: {
			latencyMs: audio.latencyMs,
			recordedPerformance: true,
			size: audio.size,
			warning: audio.warning,
			waveform: audio.waveform
		},
		mimeType: audio.mimeType,
		name: options.name || 'Performance microphone',
		url: audio.dataUrl
	});
	track.clips.push({
		duration: Math.min(duration, next.duration - start),
		gain: 1,
		id: clipId,
		label: options.name || 'Performance microphone',
		latencyMs: audio.latencyMs,
		mediaId,
		offset: Math.max(0, audio.latencyMs / 1000),
		start,
		waveform: audio.waveform
	});
	for (const take of next.performance.takes) {
		if (takeIds.includes(take.id)) {
			take.audioClipId = clipId;
		}
	}
	return next;
}

function resolveAudioTrack(project, options) {
	let track = project.tracks.find(item => (
		item.type === 'audio'
		&& item.target === options.characterId
		&& item.recordedPerformance === true
	));
	if (!track) {
		track = {
			clips: [],
			id: nextMoviePerformanceId('performance-audio-track', project.tracks),
			muted: false,
			name: options.trackName || 'Performance Microphone',
			recordedPerformance: true,
			target: options.characterId || null,
			type: 'audio'
		};
		project.tracks.push(track);
	}
	return track;
}

function maximumTakeDuration(project, takeIds) {
	return Math.max(
		0.001,
		...project.performance.takes
			.filter(take => takeIds.includes(take.id))
			.map(take => take.duration)
	);
}
