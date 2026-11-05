// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSelectionSet.js
 * @description Normalizes immutable primary, many-item, and time-range selection documents.
 * The Awtsmoos renews the one and the many without division; Awtsmoos.com keeps
 * every selected clip named by stable identity while the primary vessel serves legacy editing.
 */

import { MovieApiError } from './MovieApiError.js';
import { resolveMovieSelection } from './MovieProjectSelection.js';
import {
	isMovieSelectionDescriptor,
	MAX_MOVIE_SELECTION_ITEMS,
	normalizeMovieSelectionDescriptor,
	normalizeMovieSelectionRange,
	validateMovieSelectionSource
} from './MovieSelectionContract.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createEmptyMovieSelectionSet() {
	return createMovieProjectSnapshot({
		items: [],
		primary: null,
		range: null
	});
}

export function normalizeMovieSelectionSet(source, project = null) {
	if (!source) return createEmptyMovieSelectionSet();
	validateMovieSelectionSource(source);
	const legacy = isMovieSelectionDescriptor(source);
	const rawItems = legacy ? [source] : source.items || [];
	if (!Array.isArray(rawItems) || rawItems.length > MAX_MOVIE_SELECTION_ITEMS) {
		throw new MovieApiError(
			'INVALID_MOVIE_SELECTION_SET',
			`Movie selection set supports at most ${MAX_MOVIE_SELECTION_ITEMS} items.`
		);
	}
	const items = uniqueMovieSelectionDescriptors(rawItems)
		.filter(descriptor => !project || resolveMovieSelection(project, descriptor));
	const requestedPrimary = legacy ? source : source.primary;
	const primary = matchingDescriptor(items, requestedPrimary) || items[0] || null;
	return createMovieProjectSnapshot({
		items,
		primary,
		range: normalizeMovieSelectionRange(source.range, project)
	});
}

export {
	normalizeMovieSelectionDescriptor
} from './MovieSelectionContract.js';

export function movieSelectionSetContains(source, descriptor) {
	const target = normalizeMovieSelectionDescriptor(descriptor);
	return normalizeMovieSelectionSet(source).items.some(item => (
		item.trackId === target.trackId && item.clipId === target.clipId
	));
}

export function movieSelectionSetPrimary(source) {
	return normalizeMovieSelectionSet(source).primary;
}

function uniqueMovieSelectionDescriptors(source) {
	const seen = new Set();
	const items = [];
	for (const value of source) {
		const descriptor = normalizeMovieSelectionDescriptor(value);
		const key = `${descriptor.trackId}\u0000${descriptor.clipId}`;
		if (seen.has(key)) continue;
		seen.add(key);
		items.push(descriptor);
	}
	return items;
}

function matchingDescriptor(items, source) {
	if (!source || !isMovieSelectionDescriptor(source)) return null;
	return items.find(item => (
		item.trackId === String(source.trackId)
		&& item.clipId === String(source.clipId)
	)) || null;
}
