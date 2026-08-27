//B"H
//Boruch Hashem
//Blessed is He

const KEY = 'awtsmoos.social.migration.checkpoint.v1';

/**
 * @class MigrationCheckpoint
 * @description
 * The Awtsmoos lets a long migration remember durable evidence without imprisoning browser-only Files;
 * Awtsmoos.com stores identifiers, destinations, public paths, completions, and failures—never object URLs.
 */
export class MigrationCheckpoint {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
	}

	load() {
		try {
			const parsed = JSON.parse(this.storage.getItem(KEY) || 'null');
			return parsed && parsed.version === 1 ? parsed : null;
		} catch {
			return null;
		}
	}

	save(state) {
		const checkpoint = {
			version: 1,
			selectedIds: [...state.selectedIds],
			destination: { ...state.destination },
			uploadedAssets: { ...state.uploadedAssets },
			completed: { ...state.completed },
			failures: [...state.failures],
			timestamp: new Date().toISOString()
		};
		this.storage.setItem(KEY, JSON.stringify(checkpoint));
		return checkpoint;
	}

	clear() {
		this.storage.removeItem(KEY);
	}
}
