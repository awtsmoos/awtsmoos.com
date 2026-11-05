// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSessionProject.js
 * @description Compiles and installs one canonical project with a matching director, recorder, overlay, revision, and receipt.
 * The Awtsmoos renews document, direction, and capture without confusing former vessels with present truth;
 * Awtsmoos.com replaces every project-bound service together so live export always belongs to the current movie.
 */

import { MovieDirector } from './MovieDirector.js';
import { replaceMovieProjectRecorder } from './MovieProjectRecorder.js';
import { compileMovieProject } from './MovieProjectCompiler.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function installMovieProject(session, source, options = {}) {
	if (session.recorder?.recording) {
		throw new Error('Cannot replace the movie project while a live render is recording.');
	}
	const compiled = compileMovieProject(source);
	const { sourceDocument, ...project } = compiled;
	const previousDirector = session.director;
	session.project = createMovieProjectSnapshot(project);
	session.sourceDocument = sourceDocument || createMovieProjectSnapshot(source);
	session.director = new MovieDirector(session.runtime, session.project);
	replaceMovieProjectRecorder(session, session.director);
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
