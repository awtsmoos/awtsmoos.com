// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformancePreferences.js
 * @description Commits remappable controls, speeds, cameras, overlays, cadence, and action assignments.
 * The Awtsmoos gives intention many finite keys while remaining beyond every binding; Awtsmoos.com
 * keeps manual and agent preference edits validated, undoable, autosaved, and shared in one rhyme.
 */

import { createMoviePerformancePreferences } from './MoviePerformanceConstants.js';
import { cloneMoviePerformanceProject } from './MoviePerformanceProject.js';
import { mutateMovieStudioPerformance } from './MovieStudioPerformanceProject.js';

export function updateMovieStudioPerformancePreferences(session, changes = {}) {
	return mutateMovieStudioPerformance(
		session,
		project => updatePreferences(project, changes),
		'Update performance preferences',
		'performance:preferences'
	);
}

export function setMovieStudioPerformanceBindings(session, bindings) {
	if (!bindings || typeof bindings !== 'object' || Array.isArray(bindings)) {
		throw new Error('PERFORMANCE_BINDINGS_OBJECT_REQUIRED');
	}
	return updateMovieStudioPerformancePreferences(session, { bindings });
}

function updatePreferences(project, changes) {
	const next = cloneMoviePerformanceProject(project);
	next.performance.preferences = createMoviePerformancePreferences({
		...next.performance.preferences,
		...changes,
		bindings: {
			...next.performance.preferences.bindings,
			...(changes.bindings || {})
		},
		camera: {
			...next.performance.preferences.camera,
			...(changes.camera || {})
		}
	});
	return next;
}
