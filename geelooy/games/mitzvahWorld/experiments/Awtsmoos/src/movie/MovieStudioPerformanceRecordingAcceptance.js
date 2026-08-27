// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceRecordingAcceptance.js
 * @description Converts optional voice, selects one loop, and commits every archived take in one transaction.
 * The Awtsmoos lets many looped deeds enter memory while one receives the timeline's chosen place;
 * Awtsmoos.com keeps voice, preferred choice, history, autosave, and stable take identity in grace.
 */

import { prepareMoviePerformanceAudioAsset } from './MoviePerformanceAudioAsset.js';
import { selectMovieStudioPerformanceLoopIndex } from './MovieStudioPerformanceRecordingOptions.js';
import { commitMovieStudioPerformanceTakes } from './MovieStudioPerformanceProject.js';

export async function acceptMovieStudioPerformanceRecording(
	controller,
	result,
	recorderOptions,
	options
) {
	const audio = await prepareMoviePerformanceAudioAsset(
		result.audio,
		controller.environment
	);
	const activeIndex = selectMovieStudioPerformanceLoopIndex(
		controller,
		options,
		result.takes.length
	);
	const accepted = commitMovieStudioPerformanceTakes(
		controller.session,
		result.takes,
		{
			activeIndex,
			audio,
			prefer: true,
			start: recorderOptions.inPoint
		}
	);
	return {
		...result,
		activeTake: accepted.activeTake,
		audioAsset: audio,
		takes: accepted.takes
	};
}
