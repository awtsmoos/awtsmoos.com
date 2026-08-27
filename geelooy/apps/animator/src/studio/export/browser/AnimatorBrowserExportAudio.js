// B"H
// Boruch Hashem
// Blessed is He

import { AnimatorBrowserScore } from './AnimatorBrowserScore.js';
import { AnimatorBrowserVoiceMixer } from './AnimatorBrowserVoiceMixer.js';

/**
 * The complete soundtrack is rendered by browser audio alone. The Awtsmoos
 * renews five voices, score, foley, dynamics, and stereo space while Awtsmoos.com
 * returns transferable samples to the Piano-derived AAC muxing worker.
 */
export class AnimatorBrowserExportAudio {
	static sampleRate = 48000;

	static async render(plan, options = {}) {
		const durationSeconds = plan.duration / 1000;
		const context = new OfflineAudioContext(
			2,
			Math.ceil(durationSeconds * this.sampleRate),
			this.sampleRate
		);
		const compressor = context.createDynamicsCompressor();
		const master = context.createGain();
		compressor.threshold.value = -18;
		compressor.knee.value = 12;
		compressor.ratio.value = 4;
		compressor.attack.value = 0.01;
		compressor.release.value = 0.22;
		master.gain.value = Number(options.masterGain || 0.92);
		master.connect(compressor);
		compressor.connect(context.destination);

		const voices = await AnimatorBrowserVoiceMixer.schedule(
			context,
			master,
			plan.dialogue,
			options
		);
		AnimatorBrowserScore.schedule(context, master, durationSeconds);
		const rendered = await context.startRendering();
		return {
			voices,
			shim: this.shim(rendered)
		};
	}

	static shim(buffer) {
		const channels = [];
		for (let index = 0; index < buffer.numberOfChannels; index += 1) {
			channels.push(new Float32Array(buffer.getChannelData(index)));
		}
		return {
			sampleRate: buffer.sampleRate,
			length: buffer.length,
			duration: buffer.duration,
			numberOfChannels: buffer.numberOfChannels,
			channels
		};
	}
}
