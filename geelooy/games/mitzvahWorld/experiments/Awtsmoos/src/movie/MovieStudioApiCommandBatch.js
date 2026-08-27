// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCommandBatch.js
 * @description Compiles bounded JSON command batches into one project transaction and selection outcome.
 * The Awtsmoos renews many apparent acts within one source; Awtsmoos.com validates every
 * finite command first, then installs one project and one selected-many truth or changes nothing.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import { commitMovieStudioResult } from './MovieStudioCommandHistory.js';
import { executeMovieStudioProjectCommand } from './MovieStudioProjectCommands.js';
import { normalizeMovieStudioCommandRequest } from './MovieStudioApiCommandHelpers.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const FORBIDDEN = new Set(['redo', 'setSnapping', 'toggleSnap', 'undo']);

export function executeMovieStudioApiBatch(session, source, options = {}) {
	const requests = canonicalMovieValue(source);
	if (!Array.isArray(requests) || !requests.length || requests.length > 256) {
		throw new MovieApiError(
			'INVALID_MOVIE_COMMAND_BATCH',
			'Movie command batch must contain 1 through 256 commands.'
		);
	}
	const result = compileMovieStudioApiBatch(session, requests);
	commitMovieStudioResult(session.commands, {
		label: options.label || `Apply ${requests.length} movie commands`,
		project: result.project,
		selection: result.selectionSet
	});
	return createMovieProjectSnapshot({
		commands: result.names,
		count: requests.length,
		project: session.project,
		revision: session.revision,
		selection: session.commands.selection,
		selectionCount: session.commands.selectionSet.items.length,
		selectionSet: session.commands.selectionSet
	});
}

function compileMovieStudioApiBatch(session, requests) {
	let project = canonicalMovieValue(session.project);
	let selection = session.commands.selection;
	let selectionSet = session.commands.selectionSet;
	const names = [];
	for (const request of requests) {
		const normalized = normalizeMovieStudioCommandRequest(request);
		if (FORBIDDEN.has(normalized.internalName)) {
			throw new MovieApiError(
				'MOVIE_COMMAND_NOT_BATCHABLE',
				`Command ${normalized.internalName} cannot be included in a project batch.`
			);
		}
		const result = executeMovieStudioProjectCommand(
			{
				project,
				time: normalized.payload.time ?? session.time
			},
			selection,
			normalized.internalName,
			normalized.payload
		);
		project = result.project;
		if ('selection' in result) {
			selection = result.selection;
			selectionSet = result.selection;
		}
		names.push(normalized.internalName);
	}
	return { names, project, selectionSet };
}
