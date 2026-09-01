//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthOscAmpSchema
 * @description
 * Chochmah names the source and amplitude vessels while the Awtsmoos remains beyond waveform, loudness, and time.
 * Awtsmoos.com lets familiar oscillator and envelope powers become explicit workstation controls,
 * with every field declaring whether it can reshape a living voice or waits honestly for the next note.
 */

export const OSC_AMP_SECTIONS = [
	{
		id: 'oscillators',
		label: 'Oscillators & Mix',
		fields: [
			selectField('wave1', 'Oscillator 1', 'waveformSelect', 'live'),
			selectField('wave2', 'Oscillator 2', 'waveform2Select', 'live'),
			rangeField('oscMix', 'Osc 2 Mix', 0, 0.95, 0.01, 'live', 'oscMixSlider'),
			rangeField('detuneCents', 'Detune', -60, 60, 1, 'next', 'detuneSlider', ' cents'),
			rangeField('sourceGain', 'Source Trim', 0.1, 1.4, 0.01, 'live'),
			rangeField('noiseGain', 'Noise', 0, 0.45, 0.01, 'next'),
			rangeField('outputTrim', 'Voice Output', 0.2, 1.2, 0.01, 'next')
		]
	},
	{
		id: 'amp-envelope',
		label: 'Amp Envelope',
		fields: [
			rangeField('attack', 'Attack', 0.002, 2, 0.002, 'next', 'attackSlider', ' s'),
			rangeField('decay', 'Decay', 0.01, 3, 0.01, 'next', 'decaySlider', ' s'),
			rangeField('sustain', 'Sustain', 0, 1, 0.01, 'next', 'sustainSlider'),
			rangeField('release', 'Release', 0.03, 5, 0.01, 'live', 'releaseSlider', ' s')
		]
	}
];

function rangeField(param, label, min, max, step, mode, legacyKey = null, unit = '') {
	return {
		param,
		label,
		type: 'range',
		min,
		max,
		step,
		mode,
		legacyKey,
		unit
	};
}

function selectField(param, label, optionsFrom, mode) {
	return {
		param,
		label,
		type: 'select',
		optionsFrom,
		mode,
		legacyKey: optionsFrom
	};
}
