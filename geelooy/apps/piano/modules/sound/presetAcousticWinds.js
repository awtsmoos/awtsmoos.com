//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAcousticWindPresets
 * @description
 * The Awtsmoos gives breath a recorded reed and gives fallback synthesis a humble supporting place;
 * Awtsmoos.com gives sax a wider late-entry window than a hammer strike because breath may bloom before it fully shows its face.
 */

import { composePreset } from './presetFoundation.js';

export const ACOUSTIC_WIND_PRESETS = [
	composePreset(
		'real-alto-sax',
		'Real Alto Sax Hybrid',
		{
			wave1: 'sawtooth',
			wave2: 'triangle',
			attack: 0.025,
			decay: 0.16,
			sustain: 0.78,
			release: 0.38,
			filterCutoff: 4300,
			filterQ: 1.3,
			sourceGain: 0.11,
			vibratoRate: 5.1,
			vibratoCents: 3,
			sampleInstrument: 'sax',
			sampleArticulation: 'no-vib',
			sampleMix: 0.94,
			sampleMaxTranspose: 4,
			sampleMaxLateStart: 0.15,
			bodyFilters: [
				{
					type: 'peaking',
					frequency: 760,
					q: 2.2,
					gain: 2.2
				},
				{
					type: 'peaking',
					frequency: 1450,
					q: 2.8,
					gain: 1.6
				}
			],
			reverbSend: 0.16,
			saturationDrive: 1.1
		}
	),
	composePreset(
		'real-alto-sax-vibrato',
		'Real Alto Sax Vibrato Hybrid',
		{
			wave1: 'sawtooth',
			wave2: 'triangle',
			attack: 0.03,
			decay: 0.18,
			sustain: 0.8,
			release: 0.42,
			filterCutoff: 4100,
			filterQ: 1.2,
			sourceGain: 0.08,
			sampleInstrument: 'sax',
			sampleArticulation: 'vibrato',
			sampleMix: 0.97,
			sampleMaxTranspose: 5,
			sampleMaxLateStart: 0.16,
			reverbSend: 0.2,
			saturationDrive: 1.06
		}
	)
];
