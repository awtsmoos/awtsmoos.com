// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectPreflight.js
 * @description Produces immutable delivery blockers, warnings, readiness, and project counts.
 * The Awtsmoos is beyond readiness and failure while every finite production needs an honest gate;
 * Awtsmoos.com joins media, timeline, duration, frame rate, and resolution into one visible verdict.
 */

import { createMovieMediaHealthReport } from './MovieMediaHealth.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieProjectPreflight(project = {}) {
	const blockers = [];
	const warnings = [];
	const tracks = project.tracks || [];
	const clips = tracks.flatMap(track => track.clips || []);
	const health = createMovieMediaHealthReport(project);
	const duration = Number(project.duration);
	const fps = Number(project.fps);
	const width = Number(project.resolution?.width);
	const height = Number(project.resolution?.height);
	if (!Number.isFinite(duration) || duration <= 0) add(blockers, 'INVALID_DURATION', 'Project duration must be positive.');
	if (!Number.isFinite(fps) || fps <= 0 || fps > 240) add(blockers, 'INVALID_FRAME_RATE', 'Frame rate must be greater than zero and at most 240.');
	if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
		add(blockers, 'INVALID_RESOLUTION', 'Resolution requires positive width and height.');
	}
	if (!tracks.length) add(blockers, 'NO_TRACKS', 'Project requires at least one track.');
	if (!clips.length) add(warnings, 'NO_CLIPS', 'Project timeline contains no clips.');
	if (!health.counts.total) add(warnings, 'NO_MEDIA', 'Project media catalog is empty.');
	if (health.danglingReferences.length) add(
		blockers, 'DANGLING_MEDIA_REFERENCES', 'Timeline contains missing media references.',
		{ count: health.danglingReferences.length }
	);
	if (health.productionCounts?.referencedFullyOffline) add(
		blockers, 'REFERENCED_MEDIA_OFFLINE', 'Referenced media has neither source nor proxy.',
		{ count: health.productionCounts.referencedFullyOffline }
	);
	if (health.productionCounts?.proxyReady) add(
		warnings, 'PROXY_ONLY_MEDIA', 'Some media is available only through proxies.',
		{ count: health.productionCounts.proxyReady }
	);
	if (health.productionCounts?.unused) add(
		warnings, 'UNUSED_MEDIA', 'The media catalog contains unused assets.',
		{ count: health.productionCounts.unused }
	);
	return createMovieProjectSnapshot({
		blockers,
		counts: { clips: clips.length, media: health.counts.total, tracks: tracks.length },
		grade: blockers.length ? 'blocked' : warnings.length ? 'warning' : 'ready',
		health,
		ready: blockers.length === 0,
		warnings
	});
}

function add(collection, code, message, details = {}) {
	collection.push({ code, details, message });
}
