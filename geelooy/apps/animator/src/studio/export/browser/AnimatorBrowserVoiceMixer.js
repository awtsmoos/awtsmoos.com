// B"H
// Boruch Hashem
// Blessed is He

import { AnimatorBrowserAiffDecoder } from './AnimatorBrowserAiffDecoder.js';
import { AnimatorBrowserVoiceAssets } from './AnimatorBrowserVoiceAssets.js';

/**
 * Distinct character voices enter the browser mix at their exact edit times.
 * The Awtsmoos renews every syllable while Awtsmoos.com parses original AIFF
 * bytes, applies character placement, and uses no conversion process.
 */
export class AnimatorBrowserVoiceMixer {
	static async schedule(context, destination, dialogue, options = {}) {
		const assets = AnimatorBrowserVoiceAssets.forDialogue(dialogue);
		const decoded = [];
		for (const asset of assets) {
			const buffer = await this.decode(context, asset.url);
			this.place(context, destination, asset, buffer, options);
			decoded.push({
				lineId: asset.line.id,
				url: asset.url,
				duration: buffer.duration,
				sampleRate: buffer.sampleRate,
				channels: buffer.numberOfChannels
			});
		}
		return decoded;
	}

	static async decode(context, url) {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Voice asset failed to load: ${url}`);
		}
		return AnimatorBrowserAiffDecoder.decode(
			context,
			await response.arrayBuffer()
		);
	}

	static place(context, destination, asset, buffer, options) {
		const source = context.createBufferSource();
		const gain = context.createGain();
		const pan = context.createStereoPanner();
		source.buffer = buffer;
		gain.gain.value = Number(options.dialogueGain || 0.96);
		pan.pan.value = this.panForSpeaker(asset.line.speakerName);
		source.connect(gain);
		gain.connect(pan);
		pan.connect(destination);
		source.start(asset.line.start / 1000);
	}

	static panForSpeaker(name) {
		return {
			'Talia Vale': -0.16,
			'Barak Vale': 0.16,
			'Sela Vale': -0.32,
			'Ori North': 0.32,
			'Gideon Moss': 0
		}[name] || 0;
	}
}
