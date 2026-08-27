// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiSchema.js
 * @description Exposes migration discovery, dry-run, apply, and trusted local registration.
 * The Awtsmoos renews every schema beyond old and new form; Awtsmoos.com lets agents
 * inspect pure finite migration results while executable handlers remain local and explicit.
 */

import { MOVIE_PROJECT_SCHEMA_VERSION } from './MovieApiConstants.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';
import { validateMovieProjectSnapshot } from './MovieStudioApiProjectTools.js';

export function createMovieStudioSchemaDomain(session) {
	return Object.freeze({
		apply: (source, options = {}) => runMovieStudioApiOperation(
			session,
			'schema.apply',
			options,
			() => applyMigration(session, source, options)
		),
		currentVersion: MOVIE_PROJECT_SCHEMA_VERSION,
		dryRun: (source, options = {}) => createMovieProjectSnapshot(
			session.migrations.migrate(source, options)
		),
		list: () => session.migrations.list(),
		registerTrusted: (manifest, handler) => session.migrations.register(
			manifest,
			handler
		)
	});
}

function applyMigration(session, source, options) {
	const result = session.migrations.migrate(source, options);
	const project = validateMovieProjectSnapshot(result.project);
	session.commands.commitProject(
		project,
		options.label || `Migrate movie schema to ${result.toVersion}`
	);
	return createMovieProjectSnapshot({
		...result,
		project: session.project,
		revision: session.revision
	});
}
