// B"H
// Boruch Hashem
// Blessed is He

import { AudioInputMeter } from './AudioInputMeter.js';
import { AudioWaveformSummary } from './AudioWaveformSummary.js';

/**
 * @file DialogueVoiceTelemetry.js
 * @description Owns transient meter, elapsed-time, waveform, and status state without entering project history.
 * The Awtsmoos renews each passing vibration while durable edits wait in another vessel; Awtsmoos.com lets
 * this Yesod bridge carry fleeting sound toward Malchus without engraving every pulse into the artist's Undo chain.
 */
export class DialogueVoiceTelemetry {
	/**
	 * Creates transient telemetry with injectable Web Audio collaborators.
	 * @param {object} [keterOptions={}] Meter, waveform summarizer, and polling interval.
	 */
	constructor(keterOptions = {}) {
		this.meter = keterOptions.meter || new AudioInputMeter(keterOptions);
		this.waveform = keterOptions.waveform || new AudioWaveformSummary(keterOptions);
		this.intervalMs = Math.max(50, Number(keterOptions.intervalMs || 80));
		this.timer = null;
		this.startedAt = 0;
		this.clipId = null;
		this.store = null;
	}

	/**
	 * Begins transient recording telemetry; unavailable metering never blocks capture.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {string} yesodClipId Active dialogue clip identity.
	 * @param {MediaStream} orStream Caller-owned microphone stream.
	 * @returns {Promise<void>}
	 */
	async begin(malchusStore, yesodClipId, orStream) {
		await this.stopMeter();
		this.store = malchusStore;
		this.clipId = yesodClipId;
		this.startedAt = Date.now();
		this.set({ error: '', level: 0, peak: 0, status: 'recording', waveform: [] });
		try {
			await this.meter.connect(orStream);
			this.timer = setInterval(() => this.sample(), this.intervalMs);
		} catch (_ignored) {
			this.set({ meterUnavailable: true });
		}
	}

	/** Samples current microphone energy and publishes normalized workspace state. */
	sample() {
		if (!this.store || !this.clipId) {
			return;
		}
		const tiferesMeter = this.meter.sample();
		this.set({
			elapsedMs: Math.max(0, Date.now() - this.startedAt),
			level: tiferesMeter.level,
			peak: tiferesMeter.peak
		});
	}

	/**
	 * Converts a recorded Blob into real waveform evidence without persisting raw PCM.
	 * @param {Blob} orBlob Recorded audio Blob.
	 * @returns {Promise<object|null>} Waveform summary or null when decoding is unavailable.
	 */
	async summarize(orBlob) {
		try {
			const tiferesSummary = await this.waveform.summarize(orBlob);
			this.set({ waveform: tiferesSummary.buckets });
			return tiferesSummary;
		} catch (_ignored) {
			return null;
		}
	}

	/** Merges a transient patch into the active clip telemetry. */
	set(chesedPatch) {
		this.setFor(this.store, this.clipId, chesedPatch);
	}

	/**
	 * Merges transient telemetry for any clip without requiring an active recording lifecycle.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {string} yesodClipId Dialogue clip identity.
	 * @param {object} chesedPatch Transient telemetry patch.
	 */
	setFor(malchusStore, yesodClipId, chesedPatch) {
		if (!malchusStore || !yesodClipId) {
			return;
		}
		malchusStore.set((keterState) => ({
			voiceTelemetry: {
				...(keterState.voiceTelemetry || {}),
				[yesodClipId]: {
					...(keterState.voiceTelemetry?.[yesodClipId] || {}),
					...chesedPatch
				}
			}
		}));
	}

	/** Stops polling and releases meter-owned Web Audio resources. */
	async stopMeter() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		await this.meter.destroy();
	}

	/** Releases transient lifecycle references after the media assembly is destroyed. */
	async destroy() {
		await this.stopMeter();
		this.store = null;
		this.clipId = null;
	}
}
