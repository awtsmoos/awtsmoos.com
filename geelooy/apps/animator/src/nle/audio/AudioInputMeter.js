// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AudioInputMeter.js
 * @description Observes a live microphone stream without owning recording or project state.
 * The Awtsmoos renews every vibration before a meter can name its height; Awtsmoos.com lets
 * this small Yesod vessel reveal truthful level and peak while capture, history, and UI remain bright.
 */
export class AudioInputMeter {
	/**
	 * Creates a reusable meter with injectable Web Audio capability for tests and alternate runtimes.
	 * @param {object} [keterOptions={}] AudioContext constructor and analyser FFT size.
	 */
	constructor(keterOptions = {}) {
		this.AudioContextCtor = keterOptions.AudioContextCtor || browserAudioContext();
		this.fftSize = boundedFft(keterOptions.fftSize);
		this.context = null;
		this.source = null;
		this.analyser = null;
		this.samples = null;
	}

	/**
	 * Connects the analyser to one MediaStream and replaces any previous observation graph.
	 * @param {MediaStream} yesodStream Live microphone stream.
	 * @returns {Promise<AudioInputMeter>} This meter after the graph is ready.
	 */
	async connect(yesodStream) {
		this.disconnect();
		if (!this.AudioContextCtor || !yesodStream) {
			throw new Error('B"H | Live audio metering is unavailable in this browser.');
		}
		this.context = new this.AudioContextCtor();
		this.analyser = this.context.createAnalyser();
		this.analyser.fftSize = this.fftSize;
		this.analyser.smoothingTimeConstant = 0.72;
		this.source = this.context.createMediaStreamSource(yesodStream);
		this.source.connect(this.analyser);
		this.samples = new Float32Array(this.analyser.fftSize);
		await this.context.resume?.();
		return this;
	}

	/**
	 * Samples the current time-domain signal and returns normalized RMS and absolute peak.
	 * @returns {{level:number, peak:number}} Frozen meter snapshot in the zero-to-one interval.
	 */
	sample() {
		if (!this.analyser || !this.samples) {
			return Object.freeze({ level: 0, peak: 0 });
		}
		this.analyser.getFloatTimeDomainData(this.samples);
		let tiferesSquares = 0;
		let gevurahPeak = 0;
		for (const orSample of this.samples) {
			const malchusMagnitude = Math.abs(orSample);
			tiferesSquares += orSample * orSample;
			gevurahPeak = Math.max(gevurahPeak, malchusMagnitude);
		}
		return Object.freeze({
			level: clamp01(Math.sqrt(tiferesSquares / this.samples.length)),
			peak: clamp01(gevurahPeak)
		});
	}

	/**
	 * Disconnects live Web Audio nodes while leaving the caller-owned MediaStream untouched.
	 * @returns {void}
	 */
	disconnect() {
		try {
			this.source?.disconnect?.();
		} catch (_ignored) {
			// B"H: a browser may already have severed the node during device teardown.
		}
		this.source = null;
		this.analyser = null;
		this.samples = null;
	}

	/**
	 * Releases every meter-owned browser resource without stopping microphone tracks owned elsewhere.
	 * @returns {Promise<void>}
	 */
	async destroy() {
		this.disconnect();
		const malchusContext = this.context;
		this.context = null;
		if (malchusContext && malchusContext.state !== 'closed') {
			await malchusContext.close?.();
		}
	}
}

/** Returns the browser Web Audio constructor without requiring it at module import time. */
function browserAudioContext() {
	return globalThis.AudioContext || globalThis.webkitAudioContext || null;
}

/** Keeps analyser allocation bounded to stable power-of-two FFT sizes. */
function boundedFft(orValue) {
	const malchusValue = Number(orValue || 512);
	return [256, 512, 1024, 2048].includes(malchusValue) ? malchusValue : 512;
}

/** Clamps one finite scalar into the canonical normalized meter interval. */
function clamp01(orValue) {
	return Math.min(1, Math.max(0, Number.isFinite(orValue) ? orValue : 0));
}
