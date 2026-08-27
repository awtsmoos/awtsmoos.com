// B"H
// Boruch Hashem
// Blessed is He

import { DialogueCapturePersistence } from './DialogueCapturePersistence.js';
import { DialogueRecordingBinder } from './DialogueRecordingBinder.js';
import { Microphone } from './Microphone.js';

/**
 * A spoken line is a living performance, not a disposable URL. The Awtsmoos
 * renews the voice while this session governs microphone lifecycle and delegates
 * persistence and binding to focused vessels within Awtsmoos.com.
 */
export class DialogueRecordingSession {
	constructor(options = {}) {
		this.microphone = options.microphone || new Microphone();
		this.binder = options.binder || new DialogueRecordingBinder(options);
		this.capturePersistence = options.capturePersistence
			|| new DialogueCapturePersistence(options);
		this.activeClipId = null;
		this.player = null;
	}

	/** @param {object} store @param {string} clipId @returns {Promise<object>} */
	async start(store, clipId) {
		const clip = store.get().clips.find((item) => item.id === clipId);
		if (!clip || clip.type !== 'dialogue') {
			throw new Error('Select a dialogue clip before recording.');
		}

		if (this.activeClipId) {
			throw new Error('Another dialogue recording is already active.');
		}

		const permitted = await this.microphone.requestAccess();
		if (!permitted) {
			throw new Error(this.microphone.error || 'Microphone permission was denied.');
		}

		const result = this.microphone.startRecording();
		if (!result.ok) {
			throw new Error(result.error);
		}

		this.activeClipId = clipId;
		this.setStatus(store, clipId, 'recording', null);
		return result;
	}

	/** @param {object} store @returns {Promise<object>} */
	async stop(store) {
		const clipId = this.activeClipId;
		if (!clipId) {
			throw new Error('No dialogue recording is active.');
		}

		this.setStatus(store, clipId, 'processing', null);

		try {
			const captured = await this.microphone.stopRecording();
			const record = await this.capturePersistence.save(clipId, captured);
			return this.binder.bind(store, record);
		} catch (error) {
			this.setStatus(store, clipId, 'error', error?.message || String(error));
			throw error;
		} finally {
			this.activeClipId = null;
			this.microphone.release();
		}
	}

	restore(store) {
		return this.binder.restore(store);
	}

	play(store, clipId) {
		const clip = store.get().clips.find((item) => item.id === clipId);
		const url = this.binder.getUrl(clipId) || clip?.payload?.audioUrl;
		if (!url || typeof Audio === 'undefined') {
			throw new Error('No playable recording exists for this clip.');
		}

		this.player?.pause();
		this.player = new Audio(url);
		return this.player.play();
	}

	clear(store, clipId) {
		return this.binder.clear(store, clipId);
	}

	setStatus(store, clipId, voiceStatus, voiceError) {
		this.binder.setStatus(store, clipId, voiceStatus, voiceError);
	}

	destroy() {
		this.player?.pause();
		this.microphone.release();
		this.binder.destroy();
	}
}
