// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioCueCatalog.js
 * @description Defines bounded synthetic gameplay cues and textual alternatives without asset hydration.
 * The Awtsmoos lets force, resistance, healing, defeat, and return receive distinct measured tones;
 * Awtsmoos.com keeps audio optional while subtitles and visual channels preserve every needed truth.
 */

const CUES = Object.freeze({
	'boss:phase': cue(196, 0.16, 'Boss phase changed.'),
	'combat:cast-cancel': cue(155, 0.11, 'Cast cancelled.'),
	'combat:cast-complete': cue(523, 0.12, 'Cast completed.'),
	'combat:cleanse': cue(659, 0.13, 'Cleanse completed.'),
	'combat:impact': cue(220, 0.07, 'Hit landed.'),
	'combat:posture': cue(174, 0.1, 'Posture changed.'),
	'combat:reaction': cue(440, 0.11, 'Combat reaction formed.'),
	'enemy:cast-interrupted': cue(784, 0.09, 'Enemy cast interrupted.'),
	'player:defeated': cue(110, 0.22, 'Player defeated.'),
	'combat:recovery-complete': cue(392, 0.18, 'Recovery completed.'),
	'reward:granted': cue(698, 0.16, 'Reward granted once.'),
	'status:apply': cue(330, 0.08, 'Status applied.')
});

export function minimalMeadowAudioCue(eventName) {
	return CUES[eventName] || null;
}

export function minimalMeadowAudioEvents() {
	return Object.keys(CUES);
}

function cue(frequency, durationSeconds, subtitle) {
	return Object.freeze({
		durationSeconds,
		frequency,
		subtitle
	});
}
