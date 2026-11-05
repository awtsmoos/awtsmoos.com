// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaWorkspaceMutations.js
 * @description Mutates one cloned canonical source workspace for marks and saved searches.
 * The Awtsmoos is beyond selection and boundary while every finite edit needs measure;
 * Awtsmoos.com keeps source, search, and error behavior explicit in one focused treasure.
 */

import { normalizeMovieSavedSearch } from './MovieMediaWorkspaceContract.js';

export function selectMovieSourceMedia(project, mediaId) {
	const media = (project.media || []).find(item => item.id === String(mediaId || ''));
	if (!media) {
		throw new Error(`Unknown source media: ${mediaId}`);
	}
	project.mediaWorkspace.source = {
		inPoint: 0,
		mediaId: media.id,
		outPoint: Math.max(0, Number(media.duration || 0))
	};
}

export function markMovieSource(project, property, value) {
	const source = project.mediaWorkspace.source;
	if (!source.mediaId) {
		throw new Error('Select source media before marking in or out.');
	}
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) {
		throw new Error('Source mark time must be a finite number.');
	}
	const media = project.media.find(item => item.id === source.mediaId);
	const duration = Math.max(0, Number(media?.duration || 0));
	const time = round(Math.max(0, Math.min(duration, numericValue)));
	if (property === 'inPoint' && time > source.outPoint) {
		throw new Error('Source in point cannot follow the out point.');
	}
	if (property === 'outPoint' && time < source.inPoint) {
		throw new Error('Source out point cannot precede the in point.');
	}
	source[property] = time;
}

export function clearMovieSourceMarks(project) {
	const source = project.mediaWorkspace.source;
	const media = project.media.find(item => item.id === source.mediaId);
	source.inPoint = 0;
	source.outPoint = Math.max(0, Number(media?.duration || 0));
}

export function saveMovieMediaSearch(project, source) {
	const index = project.mediaWorkspace.savedSearches.length;
	const search = normalizeMovieSavedSearch(source, index);
	project.mediaWorkspace.savedSearches = project.mediaWorkspace.savedSearches
		.filter(item => item.id !== search.id);
	project.mediaWorkspace.savedSearches.push(search);
}

export function removeMovieMediaSearch(project, searchId) {
	const id = String(searchId || '');
	project.mediaWorkspace.savedSearches = project.mediaWorkspace.savedSearches
		.filter(item => item.id !== id);
}

function round(value) {
	return Number(Number(value).toFixed(3));
}
