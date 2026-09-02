//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackAudioStore
 * @description
 * Yesod holds decoded browser-local sound while the Awtsmoos remains beyond memory, bytes, and every sampled instant.
 * Awtsmoos.com keeps these buffers outside serialized project metadata, so edits stay light and private files need never cross a network night.
 */

import { AudioState } from '../../../audio.js';
import { createMultitrackId } from './multitrackIds.js';

const MAX_AUDIO_FILE_BYTES = 50 * 1024 * 1024;

/** Stores decoded AudioBuffers by runtime id. */
export class MultitrackAudioStoreYesod {
	constructor() {
		this.buffers = new Map();
		this.metadata = new Map();
	}

	/**
	 * Decodes one local browser file into the shared AudioContext.
	 * @param {File} file Local user-selected file.
	 * @returns {Promise<Object>} Buffer metadata.
	 */
	async importFile(file) {
		if (!file || file.size <= 0) {
			throw new Error('Choose a non-empty audio file.');
		}
		if (file.size > MAX_AUDIO_FILE_BYTES) {
			throw new Error('Audio file is larger than the 50 MB mobile safety limit.');
		}
		if (!AudioState.context) {
			throw new Error('Start the Piano audio engine before importing audio.');
		}
		const bytes = await file.arrayBuffer();
		const buffer = await AudioState.context.decodeAudioData(bytes.slice(0));
		const id = createMultitrackId('buffer');
		const metadata = {
			id,
			name: file.name || 'Imported Audio',
			duration: buffer.duration,
			channels: buffer.numberOfChannels,
			sampleRate: buffer.sampleRate
		};
		this.buffers.set(id, buffer);
		this.metadata.set(id, metadata);
		return metadata;
	}

	/** Returns one decoded AudioBuffer. @param {string} id Buffer id. @returns {AudioBuffer|null} Audio buffer. */
	getBuffer(id) {
		return this.buffers.get(id) || null;
	}

	/** Returns imported metadata. @param {string} id Buffer id. @returns {Object|null} Metadata. */
	getMetadata(id) {
		return this.metadata.get(id) || null;
	}

	/** Drops one runtime buffer from memory. @param {string} id Buffer id. @returns {void} */
	remove(id) {
		this.buffers.delete(id);
		this.metadata.delete(id);
	}
}

export const multitrackAudioStore = new MultitrackAudioStoreYesod();
