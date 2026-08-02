// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaHealth.js
 * @description Audits source, proxy, usage, dangling references, and atomic relink plans.
 * The Awtsmoos is present before path and file separate; Awtsmoos.com reveals every broken
 * finite link so a production may be repaired deliberately instead of failing during delivery.
 */

import { normalizeMovieMediaCatalog } from './MovieMediaCatalog.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieMediaHealthReport(project = {}) {
	const media = normalizeMovieMediaCatalog(project.media);
	const known = new Set(media.map(item => item.id));
	const references = createReferenceIndex(project);
	const offline = media.filter(item => item.status === 'offline' || !item.url);
	const proxyOnly = offline.filter(item => Boolean(item.proxyUrl));
	const danglingReferences = findDanglingReferences(project, known);
	const items = media.map(item => healthItem(item, references));
	const referencedFullyOffline = items.filter(item => (
		item.availability === 'fully-offline' && item.referenceCount > 0
	));
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
		deliveryBlocking: danglingReferences.length > 0 || referencedFullyOffline.length > 0,
		items,
		productionCounts: {
			fullyOffline: offline.length - proxyOnly.length,
			proxyReady: proxyOnly.length,
			referenced: items.filter(item => item.referenceCount > 0).length,
			referencedFullyOffline: referencedFullyOffline.length,
			sourceOnline: media.length - offline.length,
			unused: items.filter(item => item.referenceCount === 0).length
		}
	});
}

export function planMovieMediaRelinks(project = {}, candidates = []) {
	const media = normalizeMovieMediaCatalog(project.media);
	const byId = new Map(media.map(item => [item.id, item]));
	const seen = new Set();
	const commands = candidates.map((candidate, index) => {
		const mediaId = String(candidate?.mediaId || '');
		if (!byId.has(mediaId)) throw apiError('MOVIE_MEDIA_NOT_FOUND', `Movie media ${mediaId || '(empty)'} was not found.`);
		if (seen.has(mediaId)) throw apiError('DUPLICATE_MOVIE_MEDIA_RELINK', `Duplicate relink candidate ${mediaId}.`);
		seen.add(mediaId);
		const url = String(candidate?.url || '');
		if (!url) throw apiError('MOVIE_MEDIA_RELINK_URL_REQUIRED', `Relink candidate ${index + 1} requires a URL.`);
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

function healthItem(item, references) {
	const referenceCount = (references.get(item.id) || []).length;
	const sourceOnline = item.status !== 'offline' && Boolean(item.url);
	return {
		availability: sourceOnline ? 'source-online' : item.proxyUrl ? 'proxy-ready' : 'fully-offline',
		id: item.id,
		kind: item.kind,
		label: item.label,
		proxyOnly: !sourceOnline && Boolean(item.proxyUrl),
		referenceCount,
		status: sourceOnline ? 'online' : 'offline'
	};
}

function createReferenceIndex(project) {
	const index = new Map();
	for (const track of project.tracks || []) for (const clip of track.clips || []) {
		for (const field of ['mediaId', 'sourceMediaId']) {
			const mediaId = String(clip[field] || '');
			if (!mediaId) continue;
			const values = index.get(mediaId) || [];
			values.push({ clipId: clip.id, field, trackId: track.id });
			index.set(mediaId, values);
		}
	}
	return index;
}

function findDanglingReferences(project, known) {
	const output = [];
	for (const track of project.tracks || []) for (const clip of track.clips || []) {
		for (const field of ['mediaId', 'sourceMediaId']) {
			const mediaId = String(clip[field] || '');
			if (mediaId && !known.has(mediaId)) output.push({ clipId: clip.id, field, mediaId, trackId: track.id });
		}
	}
	return output;
}

function apiError(code, message) {
	return new MovieApiError(code, message);
}
