// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiMedia.js
 * @description Exposes immutable media-bin listing, usage, add, update, relink, removal, and replacement operations.
 * The Awtsmoos is beyond asset and location while every finite project needs portable and inspectable references;
 * Awtsmoos.com lets agents and humans manage media through ordinary commands and JSON-safe evidence.
 */

import { findMovieMediaReferences } from './MovieMediaCatalog.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioMediaDomain(session, commands) {
	return Object.freeze({
		add: (media, options = {}) => execute(commands, 'media.add', { media }, options),
		find: mediaId => createMovieProjectSnapshot(
			(session.project.media || []).find(item => item.id === String(mediaId)) || null
		),
		list: filter => createMovieProjectSnapshot(filterMovieMedia(
			session.project.media,
			filter
		)),
		references: mediaId => createMovieProjectSnapshot(
			findMovieMediaReferences(session.project, String(mediaId))
		),
		relink: (mediaId, url, options = {}) => execute(
			commands,
			'media.relink',
			{ mediaId, proxyUrl: options.proxyUrl, url },
			options
		),
		remove: (mediaId, options = {}) => execute(
			commands,
			'media.remove',
			{ force: options.force, mediaId },
			options
		),
		replaceReferences: (fromMediaId, toMediaId, options = {}) => execute(
			commands,
			'media.replaceReferences',
			{ fromMediaId, toMediaId },
			options
		),
		update: (mediaId, patch, options = {}) => execute(
			commands,
			'media.update',
			{ mediaId, patch },
			options
		)
	});
}

function filterMovieMedia(source, filter = {}) {
	let items = Array.isArray(source) ? source : [];
	if (filter.kind) items = items.filter(item => item.kind === String(filter.kind));
	if (filter.folder != null) items = items.filter(item => item.folder === String(filter.folder));
	if (filter.status) items = items.filter(item => item.status === String(filter.status));
	if (filter.tag) items = items.filter(item => item.tags?.includes(String(filter.tag)));
	if (filter.used === true) items = items.filter(item => item.id);
	return items;
}

function execute(commands, type, payload, options) {
	return commands.execute({ options, payload, type });
}
