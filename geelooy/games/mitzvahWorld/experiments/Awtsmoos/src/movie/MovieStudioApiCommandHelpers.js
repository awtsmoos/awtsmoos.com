// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCommandHelpers.js
 * @description Normalizes machine command requests and returns immutable result and selection summaries.
 * The Awtsmoos renews request and consequence before naming either; Awtsmoos.com keeps
 * aliases, options, payload, availability, primary selection, and the selected many in one grammar.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { normalizeMovieApiCommandName } from './MovieStudioApiCommandMap.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function normalizeMovieStudioCommandRequest(request, options = {}) {
	const source = typeof request === 'string'
		? { type: request }
		: canonicalMovieValue(request || {});
	return {
		internalName: normalizeMovieApiCommandName(source.type || source.name),
		options: {
			...canonicalMovieValue(options || {}),
			...canonicalMovieValue(source.options || {})
		},
		payload: canonicalMovieValue(source.payload || {}),
		publicName: String(source.type || source.name)
	};
}

export function canExecuteMovieStudioCommand(session, name) {
	const state = session.commands.state();
	const internalName = normalizeMovieApiCommandName(name);
	if (internalName === 'undo') return state.canUndo;
	if (internalName === 'redo') return state.canRedo;
	if (['delete', 'duplicate', 'split'].includes(internalName)) {
		return state.hasSelection;
	}
	return true;
}

export function createMovieStudioCommandSummary(session, command, result) {
	return createMovieProjectSnapshot({
		command,
		commandState: session.commands.state(),
		project: session.project,
		result: result == null ? null : result,
		revision: session.revision,
		selection: session.commands.selection,
		selectionCount: session.commands.selectionSet.items.length,
		selectionSet: session.commands.selectionSet
	});
}

export const normalizeMovieStudioApiCommandRequest = normalizeMovieStudioCommandRequest;
export const canExecuteMovieStudioApiCommand = canExecuteMovieStudioCommand;
