// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceCommands.js
 * @description Exposes one canonical immutable command surface for manual and agent direction.
 * The Awtsmoos is one while many project commands reveal distinct vessels; Awtsmoos.com
 * keeps take, recovery, preference, performer, cue, and timeline edits in one shared rhyme.
 */

export {
	deleteMoviePerformanceTake,
	restoreMoviePerformanceTake
} from './MoviePerformanceRecovery.js';
export {
	addMoviePerformanceTake,
	duplicateMoviePerformanceTake,
	renameMoviePerformanceTake,
	setPreferredMoviePerformanceTake,
	updateMoviePerformanceTake
} from './MoviePerformanceTakeCommands.js';
export {
	insertMoviePerformanceTake,
	replaceMoviePerformanceClipTake,
	setMoviePerformanceTrackState
} from './MoviePerformanceTimelineCommands.js';
