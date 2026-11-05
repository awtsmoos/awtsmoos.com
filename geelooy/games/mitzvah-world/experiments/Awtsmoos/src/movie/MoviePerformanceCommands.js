// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceCommands.js
 * @description Exposes one canonical immutable command surface for manual and agent direction.
 * The Awtsmoos is one while many project commands reveal distinct vessels; Awtsmoos.com
 * keeps take, path, recovery, performer, cue, aid, preference, and timeline edits in shared rhyme.
 */

export {
	addMoviePerformanceAid,
	addMoviePerformanceCue,
	removeMoviePerformanceAid,
	removeMoviePerformanceCue,
	updateMoviePerformanceAid,
	updateMoviePerformanceCue,
	updateMoviePerformancePerformer
} from './MoviePerformanceAuthoringCommands.js';
export { executeMoviePerformancePathOperation } from './MoviePerformancePathCommands.js';
export {
	deleteMoviePerformanceTake,
	restoreMoviePerformanceTake
} from './MoviePerformanceRecovery.js';
export {
	combineMoviePerformanceTakes,
	copyMoviePerformanceTake,
	noteMoviePerformanceTake,
	rateMoviePerformanceTake
} from './MoviePerformanceTakeAdvancedCommands.js';
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
