// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceStatusText.js
 * @description Formats armed actor, phases, count, rolls, loop, samples, warning, and completion evidence.
 * The Awtsmoos creates every phase beyond the words that describe it; Awtsmoos.com keeps
 * director and performer aware of time, loop, voice, warning, and capture truth in accessible rhyme.
 */

export function movieStudioPerformanceStatusParts(snapshot) {
	const recorder = snapshot.recorder;
	const character = snapshot.characters.find(item => (
		item.id === snapshot.armedCharacterId
	));
	const parts = [
		recorder.phase,
		character?.name || 'no armed performer'
	];
	if (recorder.phase === 'countdown') {
		parts.push(`${recorder.countdownRemaining.toFixed(1)}s count`);
	}
	if (recorder.phase === 'preRoll') {
		parts.push(`${recorder.preRollRemaining.toFixed(1)}s pre-roll`);
	}
	if (recorder.phase === 'postRoll') {
		parts.push(`${recorder.postRollRemaining.toFixed(1)}s post-roll`);
	}
	if (['recording', 'paused', 'loopComplete'].includes(recorder.phase)) {
		parts.push(`${recorder.elapsed.toFixed(2)}s`);
	}
	if (recorder.options?.loopCount > 1) {
		parts.push(`take ${recorder.currentLoop}/${recorder.options.loopCount}`);
	}
	parts.push(`${recorder.sampleCount} samples`);
	if (recorder.droppedSamples) {
		parts.push(`${recorder.droppedSamples} dropped`);
	}
	if (recorder.requestAutomaticStop) {
		parts.push('finalizing');
	}
	if (snapshot.warning) {
		parts.push(snapshot.warning);
	}
	return parts;
}
