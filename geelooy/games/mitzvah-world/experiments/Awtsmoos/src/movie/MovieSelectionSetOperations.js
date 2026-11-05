// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSelectionSetOperations.js
 * @description Applies replace, add, toggle, remove, many-item, and time-range selection changes.
 * The Awtsmoos renews choice without binding chooser or chosen; Awtsmoos.com reveals
 * every finite operation as one immutable set so desktop modifiers and mobile actions agree.
 */

import { MovieApiError } from './MovieApiError.js';
import {
	normalizeMovieSelectionDescriptor,
	normalizeMovieSelectionSet,
	movieSelectionSetContains
} from './MovieSelectionSet.js';

const MODES = new Set(['add', 'remove', 'replace', 'toggle']);

export function updateMovieSelectionSet(source, descriptor, mode = 'replace', project = null) {
	const selection = normalizeMovieSelectionSet(source, project);
	const target = normalizeMovieSelectionDescriptor(descriptor);
	if (project) normalizeMovieSelectionSet(target, project);
	const action = String(mode || 'replace');
	if (!MODES.has(action)) {
		throw new MovieApiError(
			'INVALID_MOVIE_SELECTION_MODE',
			`Unknown movie selection mode ${action}.`,
			{ mode: action }
		);
	}
	if (action === 'replace') {
		return normalizeMovieSelectionSet(target, project);
	}
	const contains = movieSelectionSetContains(selection, target);
	if (action === 'add' || (action === 'toggle' && !contains)) {
		return normalizeMovieSelectionSet({
			items: [...selection.items, target],
			primary: target,
			range: selection.range
		}, project);
	}
	if (action === 'remove' || action === 'toggle') {
		return removeMovieSelectionDescriptor(selection, target, project);
	}
	return selection;
}

export function replaceMovieSelectionItems(source, items, project = null) {
	const previous = normalizeMovieSelectionSet(source, project);
	return normalizeMovieSelectionSet({
		items,
		primary: Array.isArray(items) ? items.at(-1) : null,
		range: previous.range
	}, project);
}

export function setMovieSelectionRange(source, range, project = null) {
	const selection = normalizeMovieSelectionSet(source, project);
	return normalizeMovieSelectionSet({
		...selection,
		range
	}, project);
}

function removeMovieSelectionDescriptor(source, target, project) {
	const items = source.items.filter(item => (
		item.trackId !== target.trackId || item.clipId !== target.clipId
	));
	return normalizeMovieSelectionSet({
		items,
		primary: source.primary?.trackId === target.trackId
			&& source.primary?.clipId === target.clipId
			? items.at(-1) || null
			: source.primary,
		range: source.range
	}, project);
}
