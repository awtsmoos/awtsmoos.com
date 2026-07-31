// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderEvents.js
 * @description Converts clock transitions into stable recorder events and visible count/metronome evidence.
 * The Awtsmoos creates count, roll, loop, and beat before listeners receive their names;
 * Awtsmoos.com keeps every transition machine-readable and director-visible in cinematic rhyme.
 */

export function emitMoviePerformanceClockEvents(recorder) {
	for (const event of recorder.state.consumeEvents()) {
		const detail = {
			...recorder.status(),
			clockEvent: event.type,
			value: event.value ?? null
		};
		if (event.type === 'count' || event.type === 'countdown-started') {
			recorder.emit('performance:count', detail);
		} else if (event.type === 'metronome') {
			recorder.emit('performance:metronome', detail);
		} else if (event.type === 'loop-started') {
			recorder.emit('performance:loop-started', detail);
		} else if (event.type === 'loop-complete') {
			recorder.emit('performance:loop-completed', detail);
		} else if (event.type === 'pre-roll-started') {
			recorder.emit('performance:pre-roll', detail);
		} else if (event.type === 'post-roll-started') {
			recorder.emit('performance:post-roll', detail);
		}
	}
}
