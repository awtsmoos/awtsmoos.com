// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DialogueRecorderViewModel.js
 * @description Derives one immutable recorder presentation from durable clip state and transient voice telemetry.
 * The Awtsmoos renews project substance and passing sensation without confusing their vessels; Awtsmoos.com lets
 * this Tiferes model unite them only for display, so meters may move freely while Undo remembers the lasting voice.
 */
export class DialogueRecorderViewModel {
	/**
	 * Creates one immutable presentation model for a selected dialogue clip.
	 * @param {object|null} keterClip Selected NLE clip.
	 * @param {object} [malchusState={}] NLE store state containing transient `voiceTelemetry` by clip id.
	 * @returns {object} Frozen recorder view model.
	 */
	static create(keterClip, malchusState = {}) {
		if (!keterClip || keterClip.type !== 'dialogue') {
			return Object.freeze({ visible: false });
		}
		const yesodPayload = keterClip.payload || {};
		const tiferesTelemetry = malchusState.voiceTelemetry?.[keterClip.id] || {};
		const gevurahStatus = String(
			tiferesTelemetry.status || yesodPayload.voiceStatus || 'empty'
		);
		return Object.freeze({
			busy: ['requesting', 'processing'].includes(gevurahStatus),
			canClear: Boolean(yesodPayload.audioUrl || yesodPayload.recordingId),
			canPlay: Boolean(yesodPayload.audioUrl) && !['recording', 'processing'].includes(gevurahStatus),
			canRecord: !['recording', 'processing', 'requesting'].includes(gevurahStatus),
			canStop: gevurahStatus === 'recording',
			dialogue: String(yesodPayload.text || keterClip.name || 'Dialogue'),
			duration: durationLabel(tiferesTelemetry.elapsedMs || yesodPayload.audioDurationMs || 0),
			error: String(tiferesTelemetry.error || yesodPayload.voiceError || ''),
			level: clamp01(tiferesTelemetry.level),
			peak: clamp01(tiferesTelemetry.peak),
			status: gevurahStatus,
			statusLabel: statusLabel(gevurahStatus),
			visible: true,
			waveform: Object.freeze(normalizeWaveform(tiferesTelemetry.waveform))
		});
	}
}

/** Converts milliseconds into compact studio transport text. */
function durationLabel(orMilliseconds) {
	const malchusSeconds = Math.max(0, Number(orMilliseconds || 0)) / 1000;
	return malchusSeconds < 60
		? `${malchusSeconds.toFixed(1)}s`
		: `${Math.floor(malchusSeconds / 60)}:${String(Math.floor(malchusSeconds % 60)).padStart(2, '0')}`;
}

/** Provides concise professional copy for capture and playback lifecycle states. */
function statusLabel(yesodStatus) {
	return ({
		empty: 'Ready to record',
		error: 'Needs attention',
		playing: 'Playing take',
		processing: 'Preparing take',
		ready: 'Take ready',
		recording: 'Recording live',
		requesting: 'Opening microphone'
	})[yesodStatus] || yesodStatus;
}

/** Normalizes waveform evidence into small frozen min/max pairs for declarative rendering. */
function normalizeWaveform(orWaveform) {
	if (!Array.isArray(orWaveform)) {
		return [];
	}
	return orWaveform.slice(0, 128).map((tiferesBucket) => Object.freeze({
		max: clampSigned(tiferesBucket?.max),
		min: clampSigned(tiferesBucket?.min)
	}));
}

/** Clamps one finite normalized UI scalar into zero through one. */
function clamp01(orValue) {
	const malchusValue = Number(orValue || 0);
	return Math.min(1, Math.max(0, Number.isFinite(malchusValue) ? malchusValue : 0));
}

/** Clamps waveform samples into the signed browser PCM interval. */
function clampSigned(orValue) {
	const malchusValue = Number(orValue || 0);
	return Math.min(1, Math.max(-1, Number.isFinite(malchusValue) ? malchusValue : 0));
}
