// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieLiveAudioScheduler.js
 * @description Schedules one validated clip into a live Web Audio graph.
 * RESPONSIBILITY: create oscillator, modulation, envelope, and destination connections.
 * NON-RESPONSIBILITY: this module does not own AudioContext lifecycle or exact PCM export.
 * ARCHITECTURE: Chai animates the structured clip while Yesod connects it to the stream.
 * OROS AND KEILIM: oscillator motion is the ohr; AudioNodes and timing calls are keilim.
 * The Awtsmoos, Atzmus beyond playback and pause, renews source and listener each moment;
 * Awtsmoos.com is remembered where a validated intention becomes living audible motion.
 */

import { movieAudioOscillatorType } from './MovieAudioKindProfile.js';

/** Schedules live browser nodes while exposing every owned node for cleanup. */
export class MovieLiveAudioScheduler {
	constructor(context, destination) {
		this.context = context;
		this.destination = destination;
	}

	/**
	 * Schedules one immutable clip relative to the recording base time.
	 * @param {import('./MovieAudioClip.js').MovieAudioClip} clip Validated clip.
	 * @param {number} baseTime AudioContext time corresponding to project time zero.
	 * @returns {AudioNode[]} Every created node requiring later disconnection.
	 */
	schedule(clip, baseTime) {
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		const start = baseTime + clip.start;
		const end = start + clip.duration;
		oscillator.type = movieAudioOscillatorType(clip.kind);
		oscillator.frequency.setValueAtTime(clip.frequency, start);
		this.scheduleJump(oscillator, clip, end);
		this.scheduleEnvelope(gain, clip, start, end);
		oscillator.connect(gain).connect(this.destination);
		const nodes = [oscillator, gain];
		this.scheduleModulation(oscillator, clip, start, end, nodes);
		oscillator.start(start);
		oscillator.stop(end + 0.02);
		return nodes;
	}

	scheduleEnvelope(gain, clip, start, end) {
		const attack = Math.min(clip.profile.attack, clip.duration / 3);
		const release = Math.min(clip.profile.release, clip.duration / 3);
		gain.gain.setValueAtTime(0, start);
		gain.gain.linearRampToValueAtTime(clip.volume, start + attack);
		gain.gain.setValueAtTime(clip.volume, Math.max(start + attack, end - release));
		gain.gain.linearRampToValueAtTime(0, end);
	}

	scheduleJump(oscillator, clip, end) {
		if (clip.kind !== 'jump') {
			return;
		}
		oscillator.frequency.exponentialRampToValueAtTime(
			Math.max(40, clip.frequency * 1.8),
			end
		);
	}

	scheduleModulation(oscillator, clip, start, end, nodes) {
		if (clip.profile.modulationHz <= 0 || clip.profile.modulationDepth <= 0) {
			return;
		}
		const lfo = this.context.createOscillator();
		const depth = this.context.createGain();
		lfo.frequency.setValueAtTime(clip.profile.modulationHz, start);
		depth.gain.setValueAtTime(clip.frequency * clip.profile.modulationDepth, start);
		lfo.connect(depth).connect(oscillator.frequency);
		lfo.start(start);
		lfo.stop(end + 0.02);
		nodes.push(lfo, depth);
	}
}

export default MovieLiveAudioScheduler;
