//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthFilterModSchema
 * @description
 * Binah opens the spectrum and motion chambers while the Awtsmoos creates frequency, time, and change from nothing each instant.
 * Awtsmoos.com distinguishes live filter/LFO motion from attack-scheduled envelopes and newly created vibrato,
 * so every control describes what the engine can truly do rather than promising magic after a note has already begun.
 */

export const FILTER_MOD_SECTIONS = [
	{
		id: 'filter',
		label: 'Filter',
		fields: [
			selectField('filterType', 'Type', [
				'lowpass',
				'highpass',
				'bandpass',
				'notch'
			], 'live'),
			rangeField('filterCutoff', 'Cutoff', 45, 9000, 5, 'live', 'filterCutoffSlider', ' Hz'),
			rangeField('filterQ', 'Resonance', 0.1, 22, 0.1, 'live', 'filterQSlider'),
			rangeField('env1FilterMult', 'Envelope Amount', 0.25, 8, 0.05, 'next'),
			rangeField('env1Decay', 'Envelope Decay', 0.035, 4, 0.01, 'next', null, ' s')
		]
	},
	{
		id: 'modulation',
		label: 'Pitch & Modulation',
		fields: [
			rangeField('env2PitchCents', 'Pitch Envelope', -2400, 2400, 5, 'next', 'pitchDepthSlider', ' cents'),
			rangeField('env2Decay', 'Pitch Envelope Time', 0.025, 2, 0.005, 'next', 'pitchAttackSlider', ' s'),
			rangeField('lfoRate', 'LFO Rate', 0, 18, 0.05, 'live', 'lfoRateSlider', ' Hz'),
			rangeField('lfoToFilter', 'LFO → Filter', 0, 1600, 5, 'live', 'lfoDepthSlider', ' Hz'),
			rangeField('vibratoRate', 'Vibrato Rate', 0, 12, 0.05, 'next', null, ' Hz'),
			rangeField('vibratoCents', 'Vibrato Depth', 0, 36, 0.5, 'next', null, ' cents')
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

function selectField(param, label, options, mode) {
	return {
		param,
		label,
		type: 'select',
		options,
		mode,
		legacyKey: null
	};
}
