// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiSelection.js
 * @description Exposes revision-neutral primary, many-item, range, and query-driven selection operations.
 * The Awtsmoos renews chooser and chosen without changing authored story; Awtsmoos.com
 * lets desktop, mobile, human, and agent share immutable selected identities outside project history.
 */

import { queryMovieProject } from './MovieProjectQuery.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioSelectionDomain(session) {
	return Object.freeze({
		add: (descriptor, options = {}) => selectionOperation(
			session,
			'selection.add',
			options,
			() => session.commands.select({ descriptor }, { mode: 'add' })
		),
		clear: (options = {}) => selectionOperation(
			session,
			'selection.clear',
			options,
			() => session.commands.setSelectionSet(null, { publish: true })
		),
		get: () => selectionState(session),
		query: (query, options = {}) => selectionOperation(
			session,
			'selection.query',
			options,
			() => selectMovieProjectQuery(session, query)
		),
		remove: (descriptor, options = {}) => selectionOperation(
			session,
			'selection.remove',
			options,
			() => session.commands.select({ descriptor }, { mode: 'remove' })
		),
		set: (descriptor, options = {}) => selectionOperation(
			session,
			'selection.set',
			options,
			() => session.commands.select({ descriptor }, { mode: 'replace' })
		),
		setMany: (items, options = {}) => selectionOperation(
			session,
			'selection.setMany',
			options,
			() => session.commands.setSelectionItems(items)
		),
		setRange: (range, options = {}) => selectionOperation(
			session,
			'selection.setRange',
			options,
			() => session.commands.setSelectionRange(range)
		),
		toggle: (descriptor, options = {}) => selectionOperation(
			session,
			'selection.toggle',
			options,
			() => session.commands.select({ descriptor }, { mode: 'toggle' })
		)
	});
}

function selectionOperation(session, name, options, callback) {
	return runMovieStudioApiOperation(
		session,
		name,
		options,
		() => createMovieProjectSnapshot({
			result: callback(),
			...selectionState(session)
		})
	);
}

function selectMovieProjectQuery(session, query) {
	const result = queryMovieProject(session.project, {
		...query,
		entity: 'clip'
	});
	session.commands.setSelectionItems(
		result.clips.map(clip => clip.descriptor)
	);
	return result;
}

function selectionState(session) {
	return createMovieProjectSnapshot({
		revision: session.revision,
		selection: session.commands.selection,
		selectionCount: session.commands.selectionSet.items.length,
		selectionSet: session.commands.selectionSet
	});
}
