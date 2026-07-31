// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecordingClockFlow.js
 * @description Routes count, roll, punch, loop, metronome, and completion transitions for one clock.
 * The Awtsmoos creates every phase before its finite name; Awtsmoos.com keeps
 * pre-roll, recording, loop, post-roll, beat, and ready state deterministic in rhyme.
 */

import {
	advanceMoviePerformanceCountdown,
	advanceMoviePerformancePostRoll,
	advanceMoviePerformancePreRoll,
	advanceMoviePerformanceRecording,
	enterMoviePerformanceRoll
} from './MoviePerformanceRecordingClockPhases.js';

export function beginMoviePerformanceClock(clock, countIn = 0) {
	const seconds = Math.max(0, Number(countIn) || 0);
	if (seconds) {
		clock.phase = 'countdown';
		clock.countdownRemaining = seconds;
		clock.events.push({
			type: 'countdown-started',
			value: Math.ceil(seconds)
		});
	} else {
		enterMoviePerformanceRoll(clock);
	}
	return clock.snapshot();
}

export function advanceMoviePerformanceClock(clock, deltaSeconds) {
	const delta = Math.max(0, Number(deltaSeconds) || 0);
	if (clock.phase === 'countdown') {
		advanceMoviePerformanceCountdown(clock, delta);
	} else if (clock.phase === 'preRoll') {
		advanceMoviePerformancePreRoll(clock, delta);
	} else if (clock.phase === 'recording') {
		advanceMoviePerformanceRecording(clock, delta);
	} else if (clock.phase === 'postRoll') {
		advanceMoviePerformancePostRoll(clock, delta);
	}
	return clock.snapshot();
}

export function completeMoviePerformanceLoop(clock) {
	if (clock.phase !== 'loopComplete') {
		return clock.snapshot();
	}
	clock.completedLoops += 1;
	if (clock.currentLoop < clock.options.loopCount) {
		clock.currentLoop += 1;
		clock.elapsed = 0;
		clock.lastBeat = -1;
		enterMoviePerformanceRoll(clock);
		clock.events.push({
			type: 'loop-started',
			value: clock.currentLoop
		});
	} else if (clock.options.postRoll > 0) {
		clock.phase = 'postRoll';
		clock.postRollRemaining = clock.options.postRoll;
		clock.events.push({ type: 'post-roll-started' });
	} else {
		clock.phase = 'readyToStop';
	}
	return clock.snapshot();
}

export function moviePerformanceClockTime(clock) {
	if (clock.phase === 'preRoll') {
		return Math.max(
			0,
			clock.options.inPoint - clock.preRollRemaining
		);
	}
	if (clock.phase === 'postRoll') {
		const end = clock.options.outPoint
			?? clock.options.inPoint + clock.elapsed;
		return end
			+ clock.options.postRoll
			- clock.postRollRemaining;
	}
	return clock.options.inPoint + clock.elapsed;
}
