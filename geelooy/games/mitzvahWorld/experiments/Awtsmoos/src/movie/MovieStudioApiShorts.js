// B"H
// Boruch Hashem
// Blessed is He

/** Publishes one-step Short creation plus real authored-world, visual, and portrait-layout discovery. */
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiAsyncOperation, runMovieStudioApiOperation } from './MovieStudioApiOperation.js';
import { replaceMovieStudioProject } from './MovieStudioApiProjectTools.js';
import { compileMovieShortProject } from './shorts/MovieShortCompiler.js';
import { listMovieShortCompositionProfiles } from './shorts/MovieShortCompositionProfiles.js';
import { listMovieShortHeroWorlds } from './shorts/MovieShortHeroWorldDefinitions.js';
import { listMovieShortVisualPresets } from './shorts/MovieShortVisualPresets.js';

export function createMovieStudioShortsDomain(session) {
	return Object.freeze({
		apply: (source, options = {}) => runMovieStudioApiAsyncOperation(
			session, 'shorts.apply', options, () => applyShort(session, source, options)
		),
		compile: (source, options = {}) => runMovieStudioApiOperation(
			session, 'shorts.compile', options, () => compileMovieShortProject(source)
		),
		create: (source, options = {}) => runMovieStudioApiAsyncOperation(
			session, 'shorts.create', options, () => applyShort(session, source, options)
		),
		layouts: () => createMovieProjectSnapshot(listMovieShortCompositionProfiles()),
		presets: () => createMovieProjectSnapshot(listMovieShortVisualPresets()),
		worlds: () => createMovieProjectSnapshot(listMovieShortHeroWorlds())
	});
}

async function applyShort(session, source, options) {
	const result = replaceMovieStudioProject(
		session,
		compileMovieShortProject(source),
		options.label || 'Create one-Chossid authored-world Short'
	);
	const time = Math.max(0, Math.min(session.project.duration, Number(options.time) || 0));
	await session.director?.prepareExactFrame?.(time);
	session.seek(time);
	if (options.focus !== false) focusShortPreview(session);
	return result;
}

function focusShortPreview(session) {
	const controller = session.presentationController;
	controller?.toggleFocus?.(true);
	if (!controller?.state?.focused) session.view?.root?.querySelector?.('[data-focus-3d]')?.click?.();
}
