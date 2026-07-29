// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiAgent.js
 * @description Exposes contract discovery, deterministic generation, export, apply, and revision waiting.
 * The Awtsmoos renews prompt, project, and witness in one source; Awtsmoos.com lets any
 * JSON-speaking agent create the whole movie, install it once, undo it, and coordinate safely.
 */

import { compileMovieAgentManifest } from './MovieAgentCompiler.js';
import { createMovieAgentContract } from './MovieAgentContract.js';
import { createMovieAgentExample } from './MovieAgentExample.js';
import { createMovieProjectEnvelope } from './MovieProjectEnvelope.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import {
	runMovieStudioApiAsyncOperation,
	runMovieStudioApiOperation
} from './MovieStudioApiOperation.js';
import { waitForMovieStudioRevision } from './MovieStudioApiAgentWait.js';

export function createMovieStudioAgentDomain(session) {
	const domain = {
		apply: (manifest, options = {}) => applyAgentMovie(
			session,
			manifest,
			options
		),
		compile: (manifest, options = {}) => runMovieStudioApiOperation(
			session,
			'agent.compile',
			options,
			() => compileMovieAgentManifest(manifest)
		),
		contract: () => createMovieAgentContract(),
		example: () => createMovieAgentExample(),
		export: (manifest, options = {}) => runMovieStudioApiOperation(
			session,
			'agent.export',
			options,
			() => createMovieProjectSnapshot(createMovieProjectEnvelope(
				compileMovieAgentManifest(manifest),
				{
					exportedAt: options.exportedAt,
					metadata: options.metadata || {},
					revision: options.revision || 0
				}
			))
		),
		generate: (manifest, options = {}) => applyAgentMovie(
			session,
			manifest,
			options
		),
		instructions: () => createMovieAgentContract(),
		waitForRevision: (revision, options = {}) => (
			runMovieStudioApiAsyncOperation(
				session,
				'agent.waitForRevision',
				options,
				() => waitForMovieStudioRevision(session, revision, options)
			)
		)
	};
	return Object.freeze(domain);
}

function applyAgentMovie(session, manifest, options) {
	return runMovieStudioApiOperation(
		session,
		'agent.apply',
		options,
		() => {
			const project = compileMovieAgentManifest(manifest);
			session.commands.commitProject(
				project,
				options.label || 'Apply AI-generated movie'
			);
			const result = createMovieProjectSnapshot({
				project: session.project,
				revision: session.revision
			});
			session.events.emit('agent:applied', {
				metadata: options.metadata || {},
				requestId: options.requestId || null,
				revision: session.revision,
				title: session.project.title
			});
			return result;
		}
	);
}
