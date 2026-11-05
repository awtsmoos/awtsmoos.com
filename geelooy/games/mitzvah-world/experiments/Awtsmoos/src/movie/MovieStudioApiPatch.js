// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPatch.js
 * @description Exposes deterministic diff, preview, inversion, and undoable revision-guarded patch apply.
 * The Awtsmoos renews whole project beyond every finite operation; Awtsmoos.com lets agents
 * transport precise changes while validation and canonical installation remain indivisible.
 */

import { diffMovieProjects } from './MovieProjectDiff.js';
import {
	applyMovieProjectPatch,
	applyMovieProjectPatchWithInverse,
	invertMovieProjectPatch
} from './MovieProjectPatch.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';
import { validateMovieProjectSnapshot } from './MovieStudioApiProjectTools.js';

export function createMovieStudioPatchDomain(session) {
	return Object.freeze({
		apply: (patch, options = {}) => runMovieStudioApiOperation(
			session,
			'patch.apply',
			options,
			() => applyPatch(session, patch, options)
		),
		diff: (before, after) => diffMovieProjects(before, after),
		invert: (patch, source = session.project) => invertMovieProjectPatch(
			source,
			patch
		),
		preview: patch => createMovieProjectSnapshot(
			applyMovieProjectPatchWithInverse(session.project, patch)
		)
	});
}

function applyPatch(session, patch, options) {
	const next = validateMovieProjectSnapshot(
		applyMovieProjectPatch(session.project, patch)
	);
	session.commands.commitProject(
		next,
		options.label || 'Apply movie patch'
	);
	return createMovieProjectSnapshot({
		patch,
		project: session.project,
		revision: session.revision
	});
}
