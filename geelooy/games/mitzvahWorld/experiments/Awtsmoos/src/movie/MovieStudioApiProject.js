// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiProject.js
 * @description Exposes immutable project data plus empty creation, compile, envelope, query, import, and replace operations.
 * The Awtsmoos renews living project beyond every public witness; Awtsmoos.com lets agents
 * inspect, begin empty, and mutate through one revision-guarded canonical gate.
 */

import { MOVIE_PROJECT_SCHEMA_VERSION } from './MovieApiConstants.js';
import { createEmptyMovieProject } from './MovieEmptyProject.js';
import { createMovieProjectEnvelope, parseMovieProjectEnvelope, serializeMovieProjectEnvelope } from './MovieProjectEnvelope.js';
import { queryMovieProject } from './MovieProjectQuery.js';
import { findMovieProjectReferences } from './MovieProjectReferences.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';
import {
	compileMovieProjectSnapshot,
	createMovieProjectDomainProxy,
	replaceMovieStudioProject,
	validateMovieProjectSnapshot
} from './MovieStudioApiProjectTools.js';

export function createMovieStudioProjectDomain(session) {
	const domain = {
		compile: (source, options = {}) => operation(session, 'project.compile', options, () => compileMovieProjectSnapshot(source)),
		createEmpty: (options = {}) => operation(session, 'project.createEmpty', options, () => replaceMovieStudioProject(
			session, createEmptyMovieProject(options), options.label || 'Create empty movie project'
		)),
		empty: options => createMovieProjectSnapshot(createEmptyMovieProject(options)),
		export: options => createMovieProjectSnapshot(createMovieProjectEnvelope(session.project, {
			...options, revision: session.revision
		})),
		import: (source, options = {}) => operation(session, 'project.import', options, () => replaceMovieStudioProject(
			session, parseMovieProjectEnvelope(source).project, options.label || 'Import movie project'
		)),
		query: source => queryMovieProject(session.project, source),
		references: (id, options) => findMovieProjectReferences(session.project, id, options),
		replace: (source, options = {}) => operation(session, 'project.replace', options, () => replaceMovieStudioProject(
			session, source, options.label || 'Replace movie project'
		)),
		serialize: options => serializeMovieProjectEnvelope(session.project, {
			...options, revision: session.revision
		}),
		snapshot: () => createMovieProjectSnapshot(session.project),
		toJSON: () => createMovieProjectSnapshot(session.project),
		validate: (source, options = {}) => operation(session, 'project.validate', options, () => validateMovieProjectSnapshot(source))
	};
	Object.defineProperties(domain, {
		revision: { enumerable: true, get: () => session.revision },
		schemaVersion: { enumerable: true, get: () => MOVIE_PROJECT_SCHEMA_VERSION }
	});
	return createMovieProjectDomainProxy(session, domain);
}

function operation(session, name, options, action) {
	return runMovieStudioApiOperation(session, name, options, action);
}
