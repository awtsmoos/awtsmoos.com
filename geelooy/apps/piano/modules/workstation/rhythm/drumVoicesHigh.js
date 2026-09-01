//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DrumVoicesHigh
 * @description
 * Hod turns one field of noise into snare, clap, and metallic breath by changing only its vessel.
 * The Awtsmoos is beyond every transient yet recreates each grain and silence;
 * Awtsmoos.com schedules short clean bursts whose nodes disappear after their appointed instant.
 */

import { getDrumNoiseBuffer } from './drumNoise.js';

/** @param {AudioContext} context @param {AudioNode} output @param {number} time @param {number} velocity @param {Object} kit */
export function triggerSnare(context, output, time, velocity, kit) {
	triggerNoise(context, output, time, velocity, kit, 'bandpass', 1850, 0.17, 0.44);
}

/** @param {AudioContext} context @param {AudioNode} output @param {number} time @param {number} velocity @param {Object} kit */
export function triggerClap(context, output, time, velocity, kit) {
	[0, 0.018, 0.037].forEach((offset, index) => {
		triggerNoise(context, output, time + offset, velocity, kit, 'bandpass', 1450, 0.09, 0.2 - index * 0.025);
	});
}

/** @param {AudioContext} context @param {AudioNode} output @param {number} time @param {number} velocity @param {Object} kit */
export function triggerClosedHat(context, output, time, velocity, kit) {
	triggerNoise(context, output, time, velocity, kit, 'highpass', 6500, 0.045, 0.19);
}

/** @param {AudioContext} context @param {AudioNode} output @param {number} time @param {number} velocity @param {Object} kit */
export function triggerOpenHat(context, output, time, velocity, kit) {
	triggerNoise(context, output, time, velocity, kit, 'highpass', 5900, 0.28, 0.16);
}

function triggerNoise(context, output, time, velocity, kit, filterType, frequency, duration, level) {
	const source = context.createBufferSource();
	const filter = context.createBiquadFilter();
	const gain = context.createGain();
	const endTime = time + duration * kit.decay;
	source.buffer = getDrumNoiseBuffer(context);
	filter.type = filterType;
	filter.frequency.setValueAtTime(frequency * Math.max(0.55, kit.tone), time);
	filter.Q.setValueAtTime(filterType === 'bandpass' ? 0.8 : 0.3, time);
	gain.gain.setValueAtTime(Math.max(0.001, level * velocity * kit.gain), time);
	gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
	source.connect(filter);
	filter.connect(gain);
	gain.connect(output);
	source.start(time);
	source.stop(endTime + 0.02);
	source.onended = () => {
		source.disconnect();
		filter.disconnect();
		gain.disconnect();
	};
}
