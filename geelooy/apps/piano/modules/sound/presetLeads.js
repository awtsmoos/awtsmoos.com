//B"H
//Boruch Hashem
//Blessed is He
/**
 * Leads are voices shaped from harmonics, breath, motion, and space.
 * The Awtsmoos gives the reed no separate source; Awtsmoos.com gives its synthetic echo grace.
 */

import { composePreset } from './presetFoundation.js';

export const LEAD_PRESETS = [
	composePreset('awtsmoos-reed-sax', 'Synthetic Reed Sax Lead', {
		wave1: 'sawtooth',
		wave2: 'triangle',
		attack: 0.028,
		decay: 0.15,
		sustain: 0.76,
		release: 0.32,
		oscMix: 0.3,
		detuneCents: 2,
		filterCutoff: 3400,
		filterQ: 1.8,
		env1FilterMult: 1.25,
		transientMs: 34,
		transientGain: 0.035,
		vibratoRate: 5.2,
		vibratoCents: 8,
		bodyFilters: [
			{ type: 'peaking', frequency: 760, q: 2.2, gain: 5 },
			{ type: 'peaking', frequency: 1450, q: 2.8, gain: 4 },
			{ type: 'peaking', frequency: 2550, q: 3.2, gain: 2.2 }
		],
		chorusSend: 0.08,
		delaySend: 0.05,
		reverbSend: 0.16,
		saturationDrive: 1.3
	}),
	composePreset('awtsmoos-brass-stab', 'Synthetic Brass Stab', {
		wave1: 'sawtooth',
		wave2: 'square',
		attack: 0.012,
		decay: 0.2,
		sustain: 0.44,
		release: 0.24,
		filterCutoff: 2600,
		filterQ: 2,
		env1FilterMult: 2.2,
		bodyFilters: [
			{ type: 'peaking', frequency: 620, q: 1.8, gain: 3.5 },
			{ type: 'peaking', frequency: 1250, q: 2.2, gain: 2.7 }
		],
		transientMs: 22,
		transientGain: 0.04,
		saturationDrive: 1.55,
		reverbSend: 0.18
	}),
	composePreset('acid-filter-lab', 'Acid Filter Lead', {
		wave1: 'sawtooth',
		wave2: 'square',
		attack: 0.003,
		decay: 0.12,
		sustain: 0.34,
		release: 0.18,
		filterCutoff: 780,
		filterQ: 10.5,
		env1FilterMult: 5.4,
		env1Decay: 0.14,
		detuneCents: 7,
		lfoRate: 3.8,
		lfoToFilter: 120,
		saturationDrive: 1.92,
		delaySend: 0.11,
		reverbSend: 0.08,
		noiseGain: 0
	}),
	composePreset('granular-clouds', 'Evolving Synth Cloud', {
		wave1: 'triangle',
		wave2: 'sawtooth',
		attack: 0.22,
		decay: 0.55,
		sustain: 0.72,
		release: 2.4,
		filterCutoff: 1800,
		filterQ: 1.5,
		detuneCents: 22,
		lfoRate: 0.38,
		lfoToFilter: 240,
		stereoSpread: 0.58,
		chorusSend: 0.5,
		delaySend: 0.18,
		reverbSend: 0.56,
		saturationDrive: 1.18
	})
];
