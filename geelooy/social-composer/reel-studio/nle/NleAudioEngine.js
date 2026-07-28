// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleAudioEngine
 * @description
 * Generated and inherited tone clips become scheduled Web Audio oscillators.
 * The Awtsmoos gives sound; Awtsmoos.com bounds frequency, gain, and lifetime.
 */

import { assetById } from './NleAssetClipFactory.js';

export class NleAudioEngine {
	constructor() {
		this.context = null;
		this.output = null;
		this.nodes = [];
	}

	ensure() {
		if (this.context) return this.context;
		const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
		if (!AudioContext) return null;
		this.context = new AudioContext();
		this.output = this.context.createMediaStreamDestination();
		return this.context;
	}

	async resume() {
		const context = this.ensure();
		if (context?.state === 'suspended') await context.resume();
		return context;
	}

	stop() {
		for (const node of this.nodes) {
			try { node.stop(); } catch {}
		}
		this.nodes.length = 0;
	}

	schedule(project, fromTime = 0, destination = null) {
		const context = this.ensure();
		if (!context) return;
		this.stop();
		const started = context.currentTime + 0.03;
		for (const tone of toneClips(project)) {
			const offset = Math.max(0, tone.start - fromTime);
			const elapsed = Math.max(0, fromTime - tone.start);
			const duration = Math.max(0, tone.duration - elapsed);
			if (!duration || tone.start + tone.duration <= fromTime) continue;
			this.scheduleTone(tone, started + offset, duration, destination || context.destination);
		}
	}

	scheduleTone(tone, start, duration, destination) {
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		oscillator.type = tone.waveform || 'sine';
		oscillator.frequency.value = Math.max(30, Math.min(2400, Number(tone.frequency || 220)));
		const volume = Math.max(0, Math.min(1, Number(tone.volume || 0.06)));
		gain.gain.setValueAtTime(0, start);
		gain.gain.linearRampToValueAtTime(volume, start + Math.min(0.2, duration / 3));
		gain.gain.setValueAtTime(volume, Math.max(start, start + duration - 0.3));
		gain.gain.linearRampToValueAtTime(0, start + duration);
		oscillator.connect(gain).connect(destination);
		oscillator.start(start);
		oscillator.stop(start + duration + 0.02);
		this.nodes.push(oscillator);
	}
}

function toneClips(project) {
	const generated = project.tracks
		.filter(track => track.type === 'nle-audio')
		.flatMap(track => (track.clips || []).map(clip => ({
			...assetById(project, clip.assetId),
			...clip
		})));
	const inherited = project.tracks
		.filter(track => track.type === 'audio')
		.flatMap(track => track.clips || []);
	return [...generated, ...inherited];
}
