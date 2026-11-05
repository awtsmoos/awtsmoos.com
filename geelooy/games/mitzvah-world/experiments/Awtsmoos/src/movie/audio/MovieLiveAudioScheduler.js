// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieLiveAudioScheduler.js
 * @description Schedules validated clips into live Web Audio with envelope, modulation, and explicit stereo pan.
 * The Awtsmoos renews source and listener beyond left or right; Awtsmoos.com turns
 * finite frequency, volume, pan, envelope, and modulation into one cleanly owned browser node graph.
 */

import { movieAudioOscillatorType } from './MovieAudioKindProfile.js';

export class MovieLiveAudioScheduler {
	constructor(context, destination) {
		this.context = context;
		this.destination = destination;
	}

	schedule(clip, baseTime) {
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		const panner = this.context.createStereoPanner?.() || null;
		const start = baseTime + clip.start;
		const end = start + clip.duration;
		oscillator.type = movieAudioOscillatorType(clip.kind);
		oscillator.frequency.setValueAtTime(clip.frequency, start);
		this.scheduleJump(oscillator, clip, end);
		this.scheduleEnvelope(gain, clip, start, end);
		if (panner) {
			panner.pan.setValueAtTime(Number(clip.pan || 0), start);
			oscillator.connect(gain).connect(panner).connect(this.destination);
		} else {
			oscillator.connect(gain).connect(this.destination);
		}
		const nodes = [oscillator, gain, ...(panner ? [panner] : [])];
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
		if (clip.kind !== 'jump') return;
		oscillator.frequency.exponentialRampToValueAtTime(
			Math.max(40, clip.frequency * 1.8),
			end
		);
	}

	scheduleModulation(oscillator, clip, start, end, nodes) {
		if (clip.profile.modulationHz <= 0 || clip.profile.modulationDepth <= 0) return;
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
