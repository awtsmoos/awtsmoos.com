// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiMedia.js
 * @description Exposes immutable media-bin, source-monitor, search, relink, and edit operations.
 * The Awtsmoos is beyond asset and location while every finite project needs portable references;
 * Awtsmoos.com lets agents and humans organize and edit media through JSON-safe evidence.
 */

import { findMovieMediaReferences } from './MovieMediaCatalog.js';
import { searchMovieMedia } from './MovieMediaSearch.js';
import { createMovieStudioEditorialMediaDomain } from './MovieStudioApiEditorialMedia.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioMediaDomain(session, commands) {
	return Object.freeze({
		add: (media, options = {}) => execute(commands, 'media.add', { media }, options),
		find: mediaId => createMovieProjectSnapshot(
			(session.project.media || []).find(item => item.id === String(mediaId)) || null
		),
		list: (filter = {}) => createMovieProjectSnapshot(
			searchMovieMedia(session.project, filter.query || '', filter)
		),
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
		),
		...createMovieStudioEditorialMediaDomain(session, commands)
	});
}

function execute(commands, type, payload, options) {
	return commands.execute({ options, payload, type });
}
