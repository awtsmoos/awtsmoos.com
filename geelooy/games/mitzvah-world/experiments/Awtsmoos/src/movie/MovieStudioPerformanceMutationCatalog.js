// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceMutationCatalog.js
 * @description Names take, clip, recovery, preference, and metadata mutations through one commit helper.
 * The Awtsmoos is one while many authored edits retain distinct names; Awtsmoos.com
 * keeps delete, copy, insert, rename, replace, restore, prefer, and update in coherent rhyme.
 */

import {
	deleteMoviePerformanceTake,
	duplicateMoviePerformanceTake,
	insertMoviePerformanceTake,
	renameMoviePerformanceTake,
	replaceMoviePerformanceClipTake,
	restoreMoviePerformanceTake,
	setPreferredMoviePerformanceTake,
	updateMoviePerformanceTake
} from './MoviePerformanceCommands.js';

export function createMovieStudioPerformanceMutations(commit) {
	return Object.freeze({
		deleteTake: (session, takeId) => commit(
			session,
			project => deleteMoviePerformanceTake(project, takeId),
			'Delete performance take',
			'performance:take-deleted'
		),
		duplicateTake: (session, takeId, options) => commit(
			session,
			project => duplicateMoviePerformanceTake(project, takeId, options),
			'Duplicate performance take',
			'performance:take-created'
		),
		insertTake: (session, takeId, options) => commit(
			session,
			project => insertMoviePerformanceTake(project, takeId, options),
			'Insert performance take',
			'performance:clip-inserted'
		),
		renameTake: (session, takeId, name) => commit(
			session,
			project => renameMoviePerformanceTake(project, takeId, name),
			'Rename performance take',
			'performance:take-updated'
		),
		replaceClipTake: (session, trackId, clipId, takeId) => commit(
			session,
			project => replaceMoviePerformanceClipTake(
				project,
				trackId,
				clipId,
				takeId
			),
			'Replace performance take',
			'performance:take-updated'
		),
		restoreTake: (session, recoveryId) => commit(
			session,
			project => restoreMoviePerformanceTake(project, recoveryId),
			'Restore performance take',
			'performance:take-restored'
		),
		setPreferredTake: (session, takeId) => commit(
			session,
			project => setPreferredMoviePerformanceTake(project, takeId),
			'Set preferred performance take',
			'performance:take-updated'
		),
		updateTake: (session, takeId, changes, options) => commit(
			session,
			project => updateMoviePerformanceTake(
				project,
				takeId,
				changes,
				options
			),
			'Edit performance take',
			'performance:take-updated'
		)
	});
}
