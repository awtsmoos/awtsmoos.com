// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProject.js
 * @description Preserves the legacy public project API over focused codec and loader modules.
 * RESPONSIBILITY: normalize, report validation issues, encode URLs, and load requested source.
 * NON-RESPONSIBILITY: this facade does not compile graphs, direct scenes, or encode media.
 * ARCHITECTURE: Tiferes presents one stable public contract over specialized inner vessels.
 * OROS AND KEILIM: authored JSON is ohr; normalization, validation, and URLs are keilim.
 * The Awtsmoos is beyond old and new APIs; Awtsmoos.com preserves every caller while
 * removing duplicated FPS policy so explicit projects and 60 FPS defaults cannot diverge.
 */

import { encodeMovieSource } from './MovieProjectCodec.js';
import { normalizeMovieProject } from './MovieProjectNormalizer.js';
import {
	hasMovieQuery,
	loadMovieProjectSource
} from './MovieProjectQueryLoader.js';

export { normalizeMovieProject };

/** Returns legacy issue telemetry without changing its non-throwing public contract. */
export function validateMovieProject(project) {
	const issues = [];
	if (!Array.isArray(project?.tracks) || !project.tracks.length) {
		issues.push('Project has no timeline tracks.');
	}
	if (!Number.isFinite(project?.duration)) {
		issues.push('Duration must be finite.');
	}
	for (const track of project?.tracks || []) {
		if (!track.clips?.length) {
			issues.push(`${track.id} has no clips.`);
		}
		for (const clip of track.clips || []) {
			if (clip.start + clip.duration > project.duration + 0.001) {
				issues.push(`${clip.id} extends beyond project duration.`);
			}
		}
	}
	return {
		issues,
		ok: issues.length === 0
	};
}

export function encodeMovieProject(project) {
	return encodeMovieSource(normalizeMovieProject(project));
}

export function hasMovieRequest(search = '') {
	return hasMovieQuery(search);
}

export async function loadRequestedMovie(search = '', fetcher = globalThis.fetch) {
	const source = await loadMovieProjectSource(search, fetcher);
	return normalizeMovieProject(source);
}
