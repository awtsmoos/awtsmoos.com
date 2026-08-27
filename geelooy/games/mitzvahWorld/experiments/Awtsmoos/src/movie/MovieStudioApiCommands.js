// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCommands.js
 * @description Exposes structured execution, atomic batches, command discovery, validation, and state.
 * The Awtsmoos renews action before command and result appear; Awtsmoos.com preserves
 * legacy receipts while public aliases, nested options, revision guards, and coded errors remain explicit.
 */

import {
	describeMovieCommand,
	listMovieCommandCatalog,
	validateMovieCommandRequest
} from './MovieCommandCatalog.js';
import { executeMovieStudioApiBatch } from './MovieStudioApiCommandBatch.js';
import {
	canExecuteMovieStudioCommand,
	createMovieStudioCommandSummary,
	normalizeMovieStudioCommandRequest
} from './MovieStudioApiCommandHelpers.js';
import { MOVIE_API_COMMAND_NAMES } from './MovieStudioApiCommandMap.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioCommandsDomain(session) {
	return Object.freeze({
		canExecute: type => canExecuteMovieStudioCommand(session, type),
		catalog: () => listMovieCommandCatalog(),
		describe: type => describeMovieCommand(type),
		execute: (request, options = {}) => executeCommand(session, request, options),
		executeBatch: (batch, options = {}) => runMovieStudioApiOperation(
			session,
			'commands.executeBatch',
			options,
			() => executeMovieStudioApiBatch(session, batch, options)
		),
		list: () => [...MOVIE_API_COMMAND_NAMES],
		state: () => createMovieProjectSnapshot({
			...session.commands.state(),
			revision: session.revision
		}),
		validate: request => validateMovieCommandRequest(request)
	});
}

function executeCommand(session, request, options) {
	const publicName = movieCommandRequestName(request);
	const operationOptions = movieCommandOperationOptions(request, options);
	return runMovieStudioApiOperation(
		session,
		`commands.execute:${publicName}`,
		operationOptions,
		() => {
			const normalized = normalizeMovieStudioCommandRequest(
				request,
				operationOptions
			);
			const result = session.commands.execute(
				normalized.internalName,
				normalized.payload
			);
			return createMovieProjectSnapshot({
				...createMovieStudioCommandSummary(
					session,
					normalized.internalName,
					result
				),
				publicCommand: normalized.publicName
			});
		}
	);
}

function movieCommandRequestName(request) {
	if (typeof request === 'string') return request;
	return String(request?.type || request?.name || 'unknown');
}

function movieCommandOperationOptions(request, options) {
	return {
		...(options || {}),
		...(typeof request === 'object' ? request?.options || {} : {})
	};
}
