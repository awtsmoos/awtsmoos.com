// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiEditorialMedia.js
 * @description Exposes folders, search, source marks, saved searches, insert, and overwrite.
 * The Awtsmoos joins asset and timeline before their finite distinction; Awtsmoos.com
 * gives humans and agents one immutable professional editorial jurisdiction.
 */

import { listMovieMediaFolders, searchMovieMedia } from './MovieMediaSearch.js';
import { normalizeMovieMediaWorkspace } from './MovieMediaWorkspaceContract.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioEditorialMediaDomain(session, commands) {
	return Object.freeze({
		applySavedSearch: searchId => savedSearchResults(session.project, searchId),
		clearSourceMarks: (options = {}) => execute(
			commands,
			'media.clearSourceMarks',
			{},
			options
		),
		folders: () => createMovieProjectSnapshot(listMovieMediaFolders(session.project)),
		insert: (payload = {}, options = {}) => execute(
			commands,
			'media.insert',
			withTimelineTime(session, payload),
			options
		),
		markIn: (time, options = {}) => execute(
			commands,
			'media.markIn',
			{ time },
			options
		),
		markOut: (time, options = {}) => execute(
			commands,
			'media.markOut',
			{ time },
			options
		),
		overwrite: (payload = {}, options = {}) => execute(
			commands,
			'media.overwrite',
			withTimelineTime(session, payload),
			options
		),
		removeSavedSearch: (searchId, options = {}) => execute(
			commands,
			'media.removeSearch',
			{ searchId },
			options
		),
		saveSearch: (search, options = {}) => execute(
			commands,
			'media.saveSearch',
			{ search },
			options
		),
		savedSearches: () => snapshotWorkspace(session.project).savedSearches,
		search: (query = '', filter = {}) => createMovieProjectSnapshot(
			searchMovieMedia(session.project, query, filter)
		),
		selectSource: (mediaId, options = {}) => execute(
			commands,
			'media.selectSource',
			{ mediaId },
			options
		),
		source: () => snapshotWorkspace(session.project).source,
		workspace: () => snapshotWorkspace(session.project)
	});
}

function savedSearchResults(project, searchId) {
	const workspace = normalizeMovieMediaWorkspace(project.mediaWorkspace, project.media);
	const search = workspace.savedSearches.find(item => item.id === String(searchId));
	if (!search) {
		throw new Error(`Unknown saved media search: ${searchId}`);
	}
	return createMovieProjectSnapshot(searchMovieMedia(project, search.query, search.filter));
}

function snapshotWorkspace(project) {
	return createMovieProjectSnapshot(
		normalizeMovieMediaWorkspace(project.mediaWorkspace, project.media)
	);
}

function withTimelineTime(session, payload) {
	return {
		...payload,
		time: Object.hasOwn(payload, 'time') ? payload.time : session.time
	};
}

function execute(commands, type, payload, options) {
	return commands.execute({ options, payload, type });
}
