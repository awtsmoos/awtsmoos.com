// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSessionProject.js
 * @description Compiles and installs one canonical project, director, overlay, revision, and immutable event receipt.
 * The Awtsmoos renews document and runtime direction without confusing source with live vessel;
 * Awtsmoos.com replaces each finite director cleanly and publishes one stable revision-level.
 */

import { MovieDirector } from './MovieDirector.js';
import { compileMovieProject } from './MovieProjectCompiler.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function installMovieProject(session, source, options = {}) {
	const compiled = compileMovieProject(source);
	const { sourceDocument, ...project } = compiled;
	const previousDirector = session.director;
	session.project = createMovieProjectSnapshot(project);
	session.sourceDocument = sourceDocument || createMovieProjectSnapshot(source);
	session.director = new MovieDirector(session.runtime, session.project);
	session.overlay = session.director.overlay;
	session.revision = Math.max(0, Number(session.revision) || 0) + 1;
	previousDirector?.destroy?.();
	const receipt = createMovieProjectSnapshot({
		duration: session.project.duration,
		reason: String(options.reason || 'Install movie project'),
		revision: session.revision,
		title: session.project.title,
		trackCount: session.project.tracks.length
	});
	session.events?.emit?.('project:installed', receipt);
	return session.project;
}
