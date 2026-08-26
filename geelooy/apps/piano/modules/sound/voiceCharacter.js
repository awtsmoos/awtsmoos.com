//B"H
//Boruch Hashem
//Blessed is He
/**
 * Character surrounds the core tone with width, strike, shimmer, reed motion, and glass.
 * The Awtsmoos gives each ornament measured purpose; Awtsmoos.com lets richer sound arise without uncontrolled mass.
 */

import { createFmPair, startFm } from './fmEngine.js';
import { startHammer } from './hammerEngine.js';
import { createTransient, startTransient } from './transients.js';
import { startUnison } from './unisonEngine.js';

/**
 * Starts every optional character layer requested by the selected preset.
 *
 * @param {AudioContext} context Active audio context.
 * @param {object} nodes Base voice graph.
 * @param {number} frequency Fundamental frequency in hertz.
 * @param {object} preset Selected synthesis preset.
 * @param {number} velocity Normalized performance velocity.
 * @param {number} now AudioContext time.
 * @returns {object} Optional character nodes for deterministic cleanup.
 */
export function startVoiceCharacter(context, nodes, frequency, preset, velocity, now) {
	const character = {
		fm: startOptionalFm(context, nodes, frequency, preset, velocity, now),
		transient: startOptionalTransient(context, nodes, frequency, preset, velocity, now),
		vibrato: startOptionalVibrato(context, nodes, preset, now),
		unison: startUnison(context, nodes.mix, frequency, preset, now),
		hammer: startHammer(context, nodes.mix, frequency, preset, velocity, now)
	};
	return character;
}

function startOptionalFm(context, nodes, frequency, preset, velocity, now) {
	if ((preset.fmIndex || 0) <= 0) {
		return null;
	}
	const fm = createFmPair(context, nodes.osc1, frequency, preset, velocity);
	startFm(fm, now);
	return fm;
}

function startOptionalTransient(context, nodes, frequency, preset, velocity, now) {
	if ((preset.transientGain || 0) <= 0 || (preset.transientMs || 0) <= 0) {
		return null;
	}
	const transient = createTransient(context, nodes.mix, frequency, velocity, preset);
	startTransient(transient, now);
	return transient;
}

function startOptionalVibrato(context, nodes, preset, now) {
	if ((preset.vibratoCents || 0) <= 0 || (preset.vibratoRate || 0) <= 0) {
		return null;
	}
	const oscillator = context.createOscillator();
	const depth = context.createGain();
	oscillator.type = 'sine';
	oscillator.frequency.setValueAtTime(clamp(preset.vibratoRate, 0.1, 12), now);
	depth.gain.setValueAtTime(clamp(preset.vibratoCents, 0, 36), now);
	oscillator.connect(depth);
	depth.connect(nodes.osc1.detune);
	depth.connect(nodes.osc2.detune);
	oscillator.start(now);
	return { oscillator, depth };
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
