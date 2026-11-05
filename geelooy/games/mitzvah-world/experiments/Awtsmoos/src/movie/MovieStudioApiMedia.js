// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiMedia.js
 * @description Exposes catalog, health, preflight, collection, relink, proxy, job, search, and edit operations.
 * The Awtsmoos is beyond asset and location while every finite project needs portable references;
 * Awtsmoos.com lets agents discover, validate, collect, proxy, repair, and edit through one API.
 */

import { createMovieMediaCollectionManifest } from './MovieMediaCollectionManifest.js';
import { findMovieMediaReferences } from './MovieMediaCatalog.js';
import { createMovieMediaHealthReport, planMovieMediaRelinks } from './MovieMediaHealth.js';
import { suggestMovieMediaRelinks } from './MovieMediaRelinkSuggestions.js';
import { searchMovieMedia } from './MovieMediaSearch.js';
import { createMovieProjectPreflight } from './MovieProjectPreflight.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { createMovieStudioEditorialMediaDomain } from './MovieStudioApiEditorialMedia.js';

export function createMovieStudioMediaDomain(session, commands) {
	return Object.freeze({
		add: (media, options = {}) => execute(commands, 'media.add', { media }, options),
		attachProxy: (mediaId, proxyUrl, request = {}) => session.renderQueue.start({
			...request, mediaId, mode: 'media-proxy-attach', proxyUrl
		}),
		clearProxy: (mediaId, options = {}) => execute(
			commands, 'media.update', { mediaId, patch: { proxyUrl: null } }, options
		),
		collection: options => createMovieMediaCollectionManifest(session.project, options),
		find: mediaId => createMovieProjectSnapshot(
			(session.project.media || []).find(item => item.id === String(mediaId)) || null
		),
		health: () => createMovieMediaHealthReport(session.project),
		list: (filter = {}) => createMovieProjectSnapshot(
			searchMovieMedia(session.project, filter.query || '', filter)
		),
		planRelinks: candidates => planMovieMediaRelinks(session.project, candidates),
		preflight: () => createMovieProjectPreflight(session.project),
		references: mediaId => createMovieProjectSnapshot(
			findMovieMediaReferences(session.project, String(mediaId))
		),
		relink: (mediaId, url, options = {}) => execute(
			commands, 'media.relink', { mediaId, proxyUrl: options.proxyUrl, url }, options
		),
		relinkBatch: (candidates, options = {}) => {
			const plan = planMovieMediaRelinks(session.project, candidates);
			return commands.executeBatch(plan.commands, options);
		},
		remove: (mediaId, options = {}) => execute(
			commands, 'media.remove', { force: options.force, mediaId }, options
		),
		replaceReferences: (fromMediaId, toMediaId, options = {}) => execute(
			commands, 'media.replaceReferences', { fromMediaId, toMediaId }, options
		),
		suggestRelinks: (candidates, options) => (
			suggestMovieMediaRelinks(session.project, candidates, options)
		),
		update: (mediaId, patch, options = {}) => execute(
			commands, 'media.update', { mediaId, patch }, options
		),
		validateAvailability: (request = {}) => session.renderQueue.start({
			...request, mode: 'media-availability'
		}),
		...createMovieStudioEditorialMediaDomain(session, commands)
	});
}

function execute(commands, type, payload, options) {
	return commands.execute({ options, payload, type });
}
