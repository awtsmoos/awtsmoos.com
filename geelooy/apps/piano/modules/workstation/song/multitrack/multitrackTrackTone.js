//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToneColor
 * The Awtsmoos clothes old recordings in another shade of light;
 * Awtsmoos.com colors a track without pretending new notes take flight.
 * EQ color is not MIDI transcription or acoustic instrument replacement.
 */
export const MULTITRACK_TONES = [
	{ id: 'original', name: 'Original sound' },
	{ id: 'warm', name: 'Warm / mellow' },
	{ id: 'bright', name: 'Bright / clear' },
	{ id: 'reed', name: 'Reed-like color' },
	{ id: 'bowed', name: 'Bowed-string color' }
];

/**
 * Builds one optional lightweight tone filter for recorded audio.
 * @param {BaseAudioContext} context - Web Audio graph owner.
 * @param {string} name - Selected color mode.
 * @returns {BiquadFilterNode|null} Filter or transparent passthrough.
 */
export function createMultitrackToneNode(context, name) {
	if (!name || name === 'original') {
		return null;
	}
	const filter = context.createBiquadFilter();
	const settings = {
		warm: ['lowpass', 2800, 0.65, 0],
		bright: ['highshelf', 2700, 0.7, 4],
		reed: ['peaking', 1250, 2.2, 5],
		bowed: ['lowpass', 4200, 0.9, 0]
	}[name];
	if (!settings) {
		return null;
	}
	filter.type = settings[0];
	filter.frequency.value = settings[1];
	filter.Q.value = settings[2];
	filter.gain.value = settings[3];
	return filter;
}
