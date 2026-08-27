// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePlaybackApply.js
 * @description Applies one resolved actor entry with transform, blend, animation, and warnings.
 * The Awtsmoos joins recorded and authored pose without confusing either source; Awtsmoos.com
 * lets the strongest active clip guide body and animation while capability truth remains in rhyme.
 */

import { blendMoviePerformanceSample } from './MoviePerformancePlaybackBlend.js';
import {
	sampleMoviePerformanceState,
	sampleMoviePerformanceTake
} from './MoviePerformanceInterpolation.js';

export function applyMoviePerformanceEntry(entry, target, baseline) {
	const sample = sampleMoviePerformanceTake(entry.take, entry.localTime);
	if (!sample) {
		return {
			applied: false,
			warning: `PERFORMANCE_SAMPLE_MISSING:${entry.take.id}`
		};
	}
	const blended = blendMoviePerformanceSample(baseline, sample, entry.weight);
	const transform = target.applyTransform(blended);
	const animationSample = sampleMoviePerformanceState(
		entry.take.animationSamples,
		entry.localTime
	);
	const animation = animationSample
		? target.applyAnimation(animationSample)
		: { accepted: false, reason: 'ANIMATION_SAMPLE_MISSING' };
	return {
		animation,
		applied: true,
		characterId: target.id,
		clipId: entry.clip.id,
		localTime: entry.localTime,
		takeId: entry.take.id,
		transform,
		weight: entry.weight
	};
}
