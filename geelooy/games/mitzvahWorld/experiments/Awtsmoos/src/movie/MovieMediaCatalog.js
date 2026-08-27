// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaCatalog.js
 * @description Normalizes large JSON-only audio, video, image, model, and document catalogs.
 * The Awtsmoos is beyond file and reference while every finite asset needs stable identity;
 * Awtsmoos.com keeps relinking, proxies, folders, tags, scale, and portability in one schema.
 */

import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export const MOVIE_MEDIA_CATALOG_LIMIT = 100000;

const MEDIA_KINDS = new Set(['audio', 'document', 'image', 'model', 'video']);

export function normalizeMovieMediaCatalog(source) {
	const ids = new Set();
	const items = array(source).map((item, index) => normalizeMovieMediaItem(item, index));
	if (items.length > MOVIE_MEDIA_CATALOG_LIMIT) {
		throw new MovieApiError(
			'MOVIE_MEDIA_LIMIT',
			`Movie project supports at most ${MOVIE_MEDIA_CATALOG_LIMIT} media items.`,
			{ limit: MOVIE_MEDIA_CATALOG_LIMIT }
		);
	}
	for (const item of items) {
		if (ids.has(item.id)) {
			throw new MovieApiError(
				'DUPLICATE_MOVIE_MEDIA_ID',
				`Duplicate movie media id ${item.id}.`
			);
		}
		ids.add(item.id);
	}
	return createMovieProjectSnapshot(items);
}

export function normalizeMovieMediaItem(source = {}, index = 0) {
	const kind = String(source.kind || inferMediaKind(source.url));
	if (!MEDIA_KINDS.has(kind)) {
		throw new MovieApiError(
			'UNKNOWN_MOVIE_MEDIA_KIND',
			`Unknown movie media kind ${kind}.`
		);
	}
	const id = String(source.id || `media-${index + 1}`);
	return {
		duration: optionalPositive(source.duration),
		folder: String(source.folder || ''),
		height: optionalPositive(source.height),
		id,
		kind,
		label: String(source.label || id),
		metadata: source.metadata || {},
		proxyUrl: optionalString(source.proxyUrl),
		status: String(source.status || (source.url ? 'online' : 'offline')),
		tags: array(source.tags).map(String).filter(Boolean),
		thumbnailUrl: optionalString(source.thumbnailUrl),
		url: String(source.url || ''),
		width: optionalPositive(source.width)
	};
}

export function findMovieMediaReferences(project, mediaId) {
	const references = [];
	for (const track of project.tracks || []) {
		for (const clip of track.clips || []) {
			if (clip.mediaId === mediaId || clip.sourceMediaId === mediaId) {
				references.push({ clipId: clip.id, trackId: track.id });
			}
		}
	}
	return references;
}

function inferMediaKind(url) {
	const value = String(url || '').toLowerCase().split(/[?#]/)[0];
	if (/\.(mp3|wav|ogg|m4a|aac)$/.test(value)) return 'audio';
	if (/\.(mp4|webm|mov|m4v)$/.test(value)) return 'video';
	if (/\.(glb|gltf|obj|fbx)$/.test(value)) return 'model';
	if (/\.(txt|md|json|srt|vtt)$/.test(value)) return 'document';
	return 'image';
}

function optionalPositive(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : null;
}

function optionalString(value) {
	return value == null || value === '' ? null : String(value);
}

function array(value) {
	return Array.isArray(value) ? value : [];
}
