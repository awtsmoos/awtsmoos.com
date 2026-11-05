// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaCommands.js
 * @description Applies immutable add, update, remove, relink, and reference-replacement operations to project media.
 * The Awtsmoos is beyond asset and path while every finite reference must survive relocation with identity intact;
 * Awtsmoos.com keeps media-bin edits undoable and returns explicit usage receipts for every project contact.
 */

import {
	findMovieMediaReferences,
	normalizeMovieMediaCatalog,
	normalizeMovieMediaItem
} from './MovieMediaCatalog.js';
import { MovieApiError } from './MovieApiError.js';
import { cloneMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const MEDIA_COMMANDS = new Set([
	'addMedia',
	'relinkMedia',
	'removeMedia',
	'replaceMediaReferences',
	'updateMedia'
]);

export function executeMovieMediaCommand(project, name, payload = {}) {
	if (!MEDIA_COMMANDS.has(name)) return null;
	const next = cloneMovieProjectSnapshot(project);
	next.media = normalizeMovieMediaCatalog(next.media)
		.map(item => ({ ...item }));
	if (name === 'addMedia') return addMedia(next, payload);
	if (name === 'updateMedia') return updateMedia(next, payload);
	if (name === 'relinkMedia') return relinkMedia(next, payload);
	if (name === 'removeMedia') return removeMedia(next, payload);
	return replaceReferences(next, payload);
}

function addMedia(project, payload) {
	const item = normalizeMovieMediaItem(payload.media, project.media.length);
	if (project.media.some(value => value.id === item.id)) {
		throw new MovieApiError('DUPLICATE_MOVIE_MEDIA_ID', `Movie media ${item.id} already exists.`);
	}
	project.media.push(item);
	return result(project, 'Add media', { mediaId: item.id, references: [] });
}

function updateMedia(project, payload) {
	const item = requireMedia(project, payload.mediaId);
	const updated = normalizeMovieMediaItem({ ...item, ...(payload.patch || {}), id: item.id });
	project.media = project.media.map(value => value.id === item.id ? updated : value);
	return result(project, 'Update media', {
		mediaId: item.id,
		references: findMovieMediaReferences(project, item.id)
	});
}

function relinkMedia(project, payload) {
	const item = requireMedia(project, payload.mediaId);
	item.url = String(payload.url || '');
	item.status = item.url ? 'online' : 'offline';
	if (payload.proxyUrl !== undefined) {
		item.proxyUrl = payload.proxyUrl == null ? null : String(payload.proxyUrl);
	}
	return result(project, 'Relink media', {
		mediaId: item.id,
		references: findMovieMediaReferences(project, item.id)
	});
}

function removeMedia(project, payload) {
	const item = requireMedia(project, payload.mediaId);
	const references = findMovieMediaReferences(project, item.id);
	if (references.length && !payload.force) {
		throw new MovieApiError('MOVIE_MEDIA_IN_USE', `Movie media ${item.id} is still referenced.`, { references });
	}
	project.media = project.media.filter(value => value.id !== item.id);
	if (payload.force) clearReferences(project, item.id);
	return result(project, 'Remove media', { mediaId: item.id, references });
}

function replaceReferences(project, payload) {
	const from = requireMedia(project, payload.fromMediaId);
	const to = requireMedia(project, payload.toMediaId);
	const references = findMovieMediaReferences(project, from.id);
	for (const track of project.tracks || []) {
		for (const clip of track.clips || []) {
			if (clip.mediaId === from.id) clip.mediaId = to.id;
			if (clip.sourceMediaId === from.id) clip.sourceMediaId = to.id;
		}
	}
	return result(project, 'Replace media references', {
		fromMediaId: from.id,
		references,
		toMediaId: to.id
	});
}

function clearReferences(project, mediaId) {
	for (const track of project.tracks || []) {
		for (const clip of track.clips || []) {
			if (clip.mediaId === mediaId) delete clip.mediaId;
			if (clip.sourceMediaId === mediaId) delete clip.sourceMediaId;
		}
	}
}

function requireMedia(project, id) {
	const item = project.media.find(value => value.id === String(id || ''));
	if (!item) throw new MovieApiError('MOVIE_MEDIA_NOT_FOUND', `Movie media ${id || '(empty)'} was not found.`);
	return item;
}

function result(project, label, detail) {
	return { detail, label, project, selection: null };
}
