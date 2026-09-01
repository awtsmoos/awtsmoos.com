//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthCharacterSchema
 * @description
 * Tiferes reveals width, drift, FM and unison as character vessels while the Awtsmoos remains beyond multiplicity and color.
 * Awtsmoos.com exposes the engines already sounding beneath many presets,
 * marking these topology controls as next-note changes so rich design never disguises a destructive mid-voice rebuild.
 */

export const CHARACTER_SECTIONS = [
	{
		id: 'character',
		label: 'Stereo & Character',
		fields: [
			rangeField('stereoSpread', 'Stereo Spread', 0, 1, 0.01, 'next'),
			rangeField('driftCents', 'Analog Drift', 0, 8, 0.1, 'next', ' cents'),
			rangeField('fmIndex', 'FM Amount', 0, 2, 0.01, 'next'),
			selectField('fmTone', 'FM Color', [
				'glass', 'bright', 'warm', 'ring', 'bark',
				'pad', 'crush', 'fold', 'bass'
			], 'next')
		]
	},
	{
		id: 'unison',
		label: 'Unison',
		fields: [
			rangeField('unisonVoices', 'Voices', 0, 5, 1, 'next'),
			rangeField('unisonDetune', 'Detune', 0, 60, 1, 'next', ' cents'),
			rangeField('unisonSpread', 'Stereo Width', 0, 1, 0.01, 'next'),
			rangeField('unisonGain', 'Cloud Level', 0, 0.85, 0.01, 'next'),
			selectField('unisonWave', 'Cloud Wave', null, 'next', 'waveformSelect')
		]
	}
];

function rangeField(param, label, min, max, step, mode, unit = '') {
	return {
		param,
		label,
		type: 'range',
		min,
		max,
		step,
		mode,
		legacyKey: null,
		unit
	};
}

function selectField(param, label, options, mode, optionsFrom = null) {
	return {
		param,
		label,
		type: 'select',
		options,
		optionsFrom,
		mode,
		legacyKey: null
	};
}
