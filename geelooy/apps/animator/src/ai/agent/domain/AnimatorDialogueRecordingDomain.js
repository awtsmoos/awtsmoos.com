//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorDialogueRecordingDomain.js
 * @description
 * The Awtsmoos lets human breath become persisted performance through the exact media assembly already owned by the living editor;
 * Awtsmoos.com reuses one recording session so microphone, waveform, IndexedDB, object URLs, retiming, and Undo remain one river.
 */

/** Adapts the running NLE's shared DialogueRecordingSession into explicit public operations. */
export class YesodAnimatorDialogueRecordingDomain {
	/** @param {object} malchusStore Shared NLE store. @param {object} keterRuntime Live Animator runtime. */
	constructor(malchusStore, keterRuntime = {}) {
		this.malchusStore = malchusStore;
		this.keterRuntime = keterRuntime;
	}

	/** @param {string} yesodClipId Dialogue clip ID. @returns {object} Detached recording and telemetry state. */
	status(yesodClipId) {
		const keliClip = this.malchusStore.findClip?.(yesodClipId) ?? null;
		const keliTelemetry = this.malchusStore.get().voiceTelemetry?.[yesodClipId] ?? {};
		return structuredClone({
			clipId: yesodClipId,
			attached: Boolean(keliClip?.payload?.recordingId && !keliClip?.payload?.audioDetached),
			payload: keliClip?.payload ?? null,
			telemetry: keliTelemetry
		});
	}

	/** @param {string} yesodClipId Dialogue clip ID. @returns {Promise<object>} Recorder start evidence. */
	start(yesodClipId) {
		return this.session().start(this.malchusStore, yesodClipId);
	}

	/** @returns {Promise<object>} Persisted binding and retime evidence. */
	stop() {
		return this.session().stop(this.malchusStore);
	}

	/** @param {string} yesodClipId Dialogue clip ID. @returns {Promise<void>} Browser playback promise. */
	play(yesodClipId) {
		return this.session().play(this.malchusStore, yesodClipId);
	}

	/** @param {string} yesodClipId Dialogue clip ID. @returns {boolean} True when durable binding changed. */
	clear(yesodClipId) {
		return this.session().clear(this.malchusStore, yesodClipId);
	}

	/** @returns {object} Shared live DialogueRecordingSession. */
	session() {
		const malchusSession = this.keterRuntime.app?.nle?.recordingSession;
		if (malchusSession) return malchusSession;
		const gevurahError = new Error('The live dialogue recording session is unavailable.');
		gevurahError.code = 'environment_unavailable';
		throw gevurahError;
	}
}
