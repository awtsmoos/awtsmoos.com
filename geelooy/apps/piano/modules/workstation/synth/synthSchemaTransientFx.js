//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthTransientFxSchema
 * @description
 * Hod gives attacks their hammer and space its echo while the Awtsmoos remains beyond impact, decay, distance, and return.
 * Awtsmoos.com gathers transient character and standard send effects into one explicit pair of sections,
 * separating live ambience from character sources that are born only when the next note enters the world.
 */

export const TRANSIENT_FX_SECTIONS = [
	{
		id: 'transients',
		label: 'Attack Character',
		fields: [
			rangeField('transientMs', 'Noise Transient', 0, 120, 1, 'next', null, ' ms'),
			rangeField('transientGain', 'Transient Level', 0, 0.25, 0.005, 'next'),
			rangeField('hammerAmount', 'Hammer Amount', 0, 0.3, 0.005, 'next'),
			rangeField('hammerDecay', 'Hammer Decay', 0.02, 1, 0.01, 'next', null, ' s'),
			selectField('hammerWave', 'Hammer Wave', 'waveformSelect', 'next')
		]
	},
	{
		id: 'effects',
		label: 'Effects',
		fields: [
			rangeField('chorusSend', 'Chorus', 0, 0.8, 0.01, 'live', 'chorusSlider'),
			rangeField('delaySend', 'Delay Mix', 0, 0.8, 0.01, 'live', 'delaySlider'),
			rangeField('delayTime', 'Delay Time', 0.03, 1, 0.005, 'live', 'delayTimeSlider', ' s'),
			rangeField('delayFeedback', 'Delay Feedback', 0, 0.85, 0.01, 'live', 'delayFeedbackSlider'),
			rangeField('saturationDrive', 'Drive', 1, 3, 0.01, 'next', 'saturationSlider'),
			rangeField('reverbSend', 'Reverb', 0, 0.8, 0.01, 'live', 'reverbSlider')
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
		legacyKey: null
	};
}
