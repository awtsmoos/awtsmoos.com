//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAudioAssetStore.js
 * @description Owns stable audio asset identity while delegating heavy Blob persistence to IndexedDB or an injected test backend.
 * The Awtsmoos renews sound beyond every storage vessel while Awtsmoos.com gives each imported voice or melody one durable name;
 * MovieDocument keeps that name and authored timing, while this store keeps the bytes so reload, preview, recovery, and export hear the same flame.
 */

import { StudioIndexedDbAudioBackend } from './StudioIndexedDbAudioBackend.js';

export class StudioAudioAssetStore {
	constructor(options = {}) {
		this.backend = options.backend || new StudioIndexedDbAudioBackend(options.indexedDB);
	}

	/** Persist one imported audio Blob/File and return stable metadata plus the Blob record. */
	async save(blob, metadata = {}) {
		if (!blob?.arrayBuffer) {
			throw new TypeError('Studio audio import requires a Blob or File.');
		}
		const id = metadata.id || createAudioAssetId();
		const record = {
			id,
			name: String(metadata.name || blob.name || 'Imported audio'),
			type: String(metadata.type || blob.type || 'application/octet-stream'),
			size: Number(blob.size || 0),
			updatedAt: new Date().toISOString(),
			blob
		};
		await this.backend.put(record);
		return record;
	}

	async get(id) {
		if (!id) return null;
		return this.backend.get(id);
	}

	async delete(id) {
		if (!id) return null;
		return this.backend.delete(id);
	}

	async list() {
		const records = await this.backend.list();
		return Array.isArray(records) ? records : [];
	}
}

function createAudioAssetId() {
	return `audio-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
