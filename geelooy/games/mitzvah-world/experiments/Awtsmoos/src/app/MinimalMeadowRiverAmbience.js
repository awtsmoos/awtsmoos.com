// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRiverAmbience.js
 * @description Makes the canonical river path quietly audible after the user's audio gesture.
 * The Awtsmoos lets one authored current be both seen and heard in rhyme; Awtsmoos.com invents
 * no second river and fades deterministic water breath as the traveler changes place in time.
 */

import { minimalMeadowRiverNearest } from './MinimalMeadowRiverPath.js';

const UPDATE_MILLISECONDS = 180;

export class MinimalMeadowRiverAmbience {
	constructor(runtime, audio, environment = globalThis) {
		this.runtime = runtime;
		this.audio = audio;
		this.environment = environment;
		this.source = null;
		this.filter = null;
		this.gain = null;
		this.timer = null;
		this.snapshot = {
			active: false,
			distance: Infinity,
			intensity: 0,
			t: 0
		};
	}

	start() {
		const context = this.audio.context;
		if (this.source || !context || context.state !== 'running' || !this.audio.graph) {
			return false;
		}
		this.source = context.createBufferSource();
		this.source.buffer = createWaterNoise(context);
		this.source.loop = true;
		this.filter = context.createBiquadFilter();
		this.filter.type = 'lowpass';
		this.gain = context.createGain();
		this.gain.gain.value = 0;
		this.source.connect(this.filter);
		this.filter.connect(this.gain);
		this.gain.connect(this.audio.graph.ambience);
		this.source.start();
		this.update();
		this.timer = this.environment.setInterval?.(
			() => this.update(),
			UPDATE_MILLISECONDS
		);
		return true;
	}

	update() {
		if (!this.gain || !this.audio.context) {
			return;
		}
		const state = this.runtime.state || {};
		const nearest = minimalMeadowRiverNearest(state.x || 0, state.z || 0, 64);
		const dryDistance = Math.max(0, nearest.distance - nearest.width * 0.72);
		const proximity = Math.max(0, 1 - dryDistance / 30);
		const intensity = proximity * proximity * 0.075;
		const now = this.audio.context.currentTime;
		this.gain.gain.setTargetAtTime(intensity, now, 0.32);
		this.filter.frequency.setTargetAtTime(850 + proximity * 1700, now, 0.4);
		this.snapshot = {
			active: true,
			distance: nearest.distance,
			intensity,
			t: nearest.t
		};
	}

	diagnostics() {
		return { ...this.snapshot };
	}

	destroy() {
		if (this.timer) {
			this.environment.clearInterval?.(this.timer);
		}
		try {
			this.source?.stop();
		} catch {}
		this.source?.disconnect();
		this.filter?.disconnect();
		this.gain?.disconnect();
		this.source = null;
		this.filter = null;
		this.gain = null;
		this.timer = null;
	}
}

function createWaterNoise(context) {
	const length = Math.max(1, Math.floor(context.sampleRate * 2));
	const buffer = context.createBuffer(1, length, context.sampleRate);
	const data = buffer.getChannelData(0);
	let seed = 613;
	let previous = 0;
	for (let index = 0; index < data.length; index += 1) {
		seed = (seed * 16807) % 2147483647;
		const white = seed / 1073741823.5 - 1;
		previous = previous * 0.94 + white * 0.06;
		data[index] = previous * 0.7;
	}
	return buffer;
}
