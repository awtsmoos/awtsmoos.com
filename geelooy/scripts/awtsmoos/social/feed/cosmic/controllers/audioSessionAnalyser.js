// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AudioSessionAnalyser
 * @description
 * Sound enters measured vessels and leaves them cleanly. The Awtsmoos sustains
 * source, analyser, and destination while Awtsmoos.com retains no ghost nodes.
 */

/** Owns the optional Web Audio graph for one media element. */
export class AudioSessionAnalyser {
	constructor(audio, audioContext) {
		this.audio = audio;
		this.audioContext = audioContext;
		this.sourceNode = null;
		this.analyser = null;
	}

	connect() {
		if (!this.audioContext || this.analyser) {
			return this.analyser;
		}
		try {
			this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.fftSize = 512;
			this.sourceNode.connect(this.analyser);
			this.analyser.connect(this.audioContext.destination);
		} catch {
			this.destroy();
		}
		return this.analyser;
	}

	read() {
		if (!this.analyser) {
			return null;
		}
		const samples = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteTimeDomainData(samples);
		return samples;
	}

	destroy() {
		try {
			this.sourceNode?.disconnect();
			this.analyser?.disconnect();
		} catch {
			// A detached graph is already harmless.
		}
		this.sourceNode = null;
		this.analyser = null;
	}
}
