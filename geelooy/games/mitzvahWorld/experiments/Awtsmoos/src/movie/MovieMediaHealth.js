// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaHealth.js
 * @description Audits offline media, proxy-only sources, dangling references, and atomic relink plans.
 * The Awtsmoos is present before path and file separate; Awtsmoos.com reveals every broken
 * finite link so a production may be repaired deliberately instead of failing during delivery.
 */

import { findMovieMediaReferences, normalizeMovieMediaCatalog } from './MovieMediaCatalog.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieMediaHealthReport(project = {}) {
	const media = normalizeMovieMediaCatalog(project.media);
	const known = new Set(media.map(item => item.id));
	const offline = media.filter(item => item.status === 'offline' || !item.url);
	const proxyOnly = offline.filter(item => Boolean(item.proxyUrl));
	const danglingReferences = findDanglingMovieMediaReferences(project, known);
	const items = media.map(item => ({
		id: item.id,
		kind: item.kind,
		label: item.label,
		proxyOnly: !item.url && Boolean(item.proxyUrl),
		referenceCount: findMovieMediaReferences(project, item.id).length,
		status: item.status === 'offline' || !item.url ? 'offline' : 'online'
	}));
	return createMovieProjectSnapshot({
		blocking: offline.length > 0 || danglingReferences.length > 0,
		counts: {
			danglingReferences: danglingReferences.length,
			offline: offline.length,
			online: media.length - offline.length,
			proxyOnly: proxyOnly.length,
			total: media.length
		},
		danglingReferences,
		items
	});
}

export function planMovieMediaRelinks(project = {}, candidates = []) {
	const media = normalizeMovieMediaCatalog(project.media);
	const byId = new Map(media.map(item => [item.id, item]));
	const seen = new Set();
	const commands = candidates.map((candidate, index) => {
		const mediaId = String(candidate?.mediaId || '');
		if (!byId.has(mediaId)) throw error('MOVIE_MEDIA_NOT_FOUND', `Movie media ${mediaId || '(empty)'} was not found.`);
		if (seen.has(mediaId)) throw error('DUPLICATE_MOVIE_MEDIA_RELINK', `Duplicate relink candidate ${mediaId}.`);
		seen.add(mediaId);
		const url = String(candidate?.url || '');
		if (!url) throw error('MOVIE_MEDIA_RELINK_URL_REQUIRED', `Relink candidate ${index + 1} requires a URL.`);
		return {
			payload: {
				mediaId,
				proxyUrl: candidate.proxyUrl === undefined ? byId.get(mediaId).proxyUrl : candidate.proxyUrl,
				url
			},
			type: 'media.relink'
		};
	});
	const planned = new Set(commands.map(command => command.payload.mediaId));
	const unresolved = media
		.filter(item => (item.status === 'offline' || !item.url) && !planned.has(item.id))
		.map(item => item.id);
	return createMovieProjectSnapshot({ commands, ready: unresolved.length === 0, unresolved });
}

function findDanglingMovieMediaReferences(project, known) {
	const references = [];
	for (const track of project.tracks || []) {
		for (const clip of track.clips || []) {
			for (const field of ['mediaId', 'sourceMediaId']) {
				const mediaId = clip[field];
				if (mediaId && !known.has(String(mediaId))) {
					references.push({ clipId: clip.id, field, mediaId: String(mediaId), trackId: track.id });
				}
			}
		}
	}
	return references;
}

function error(code, message) {
	return new MovieApiError(code, message);
}
