// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecordingClockPhases.js
 * @description Advances countdown, pre-roll, recording, metronome, punch, and post-roll phases.
 * The Awtsmoos creates each phase before its finite transition; Awtsmoos.com keeps
 * count, roll, beat, range end, and readiness ordered without mixing their cinematic rhyme.
 */

const CLOCK_BOUNDARY_EPSILON = 0.000000001;
const CLOCK_SECOND_SCALE = 1000000000;

export function advanceMoviePerformanceCountdown(clock, delta) {
	const former = Math.ceil(clock.countdownRemaining);
	clock.countdownRemaining = Math.max(0, clock.countdownRemaining - delta);
	const current = Math.ceil(clock.countdownRemaining);
	if (current !== former && current > 0) {
		clock.events.push({ type: 'count', value: current });
	}
	if (!clock.countdownRemaining) {
		enterMoviePerformanceRoll(clock);
	}
}

export function advanceMoviePerformancePreRoll(clock, delta) {
	clock.preRollRemaining = Math.max(0, clock.preRollRemaining - delta);
	if (!clock.preRollRemaining) {
		clock.phase = 'recording';
		clock.events.push({ type: 'recording-started' });
	}
}

export function advanceMoviePerformanceRecording(clock, delta) {
	const former = clock.elapsed;
	clock.elapsed += delta;
	emitMetronome(clock, former, clock.elapsed);
	const duration = moviePerformanceRangeDuration(clock);
	if (duration != null
		&& clock.elapsed + CLOCK_BOUNDARY_EPSILON >= duration) {
		clock.elapsed = duration;
		clock.phase = 'loopComplete';
		clock.events.push({
			type: 'loop-complete',
			value: clock.currentLoop
		});
	}
}

export function advanceMoviePerformancePostRoll(clock, delta) {
	clock.postRollRemaining = Math.max(0, clock.postRollRemaining - delta);
	if (!clock.postRollRemaining) {
		clock.phase = 'readyToStop';
		clock.events.push({ type: 'post-roll-complete' });
	}
}

export function enterMoviePerformanceRoll(clock) {
	if (clock.options.preRoll > 0) {
		clock.phase = 'preRoll';
		clock.preRollRemaining = clock.options.preRoll;
		clock.events.push({ type: 'pre-roll-started' });
	} else {
		clock.phase = 'recording';
		clock.events.push({ type: 'recording-started' });
	}
}

export function moviePerformanceRangeDuration(clock) {
	if (clock.options.outPoint == null) {
		return null;
	}
	const duration = clock.options.outPoint - clock.options.inPoint;
	return Math.round(duration * CLOCK_SECOND_SCALE) / CLOCK_SECOND_SCALE;
}

function emitMetronome(clock, former, current) {
	if (!clock.options.metronome) {
		return;
	}
	const first = Math.floor(former) + 1;
	const last = Math.floor(current);
	for (let beat = first; beat <= last; beat += 1) {
		if (beat !== clock.lastBeat) {
			clock.lastBeat = beat;
			clock.events.push({ type: 'metronome', value: beat });
		}
	}
}
