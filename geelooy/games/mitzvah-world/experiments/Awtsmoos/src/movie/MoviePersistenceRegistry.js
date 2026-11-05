// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePersistenceRegistry.js
 * @description Owns trusted local persistence adapters and serializable capability manifests.
 * The Awtsmoos renews implementation beyond its public name; Awtsmoos.com lets agents
 * discover finite adapter capabilities while load, save, list, and remove functions remain local.
 */

import { MovieApiError } from './MovieApiError.js';
import {
	normalizeMoviePersistenceManifest,
	validateMoviePersistenceAdapter
} from './MoviePersistenceAdapterContract.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export class MoviePersistenceRegistry {
	constructor() {
		this.adapters = new Map();
		this.activeId = null;
	}

	register(manifest, adapter) {
		const value = normalizeMoviePersistenceManifest(manifest);
		validateMoviePersistenceAdapter(adapter);
		if (this.adapters.has(value.id)) {
			throw new MovieApiError(
				'DUPLICATE_MOVIE_PERSISTENCE_ADAPTER',
				`Movie persistence adapter ${value.id} is already registered.`
			);
		}
		this.adapters.set(value.id, { adapter, manifest: value });
		if (!this.activeId) this.activeId = value.id;
		return value;
	}

	unregister(id) {
		const key = String(id);
		const removed = this.adapters.delete(key);
		if (this.activeId === key) {
			this.activeId = this.adapters.keys().next().value || null;
		}
		return removed;
	}

	select(id) {
		const key = String(id);
		if (!this.adapters.has(key)) {
			throw new MovieApiError(
				'MOVIE_PERSISTENCE_ADAPTER_NOT_FOUND',
				`Movie persistence adapter ${key} was not found.`,
				{ adapterId: key }
			);
		}
		this.activeId = key;
		return this.state();
	}

	get(id = this.activeId) {
		const key = String(id || '');
		const entry = this.adapters.get(key);
		if (!entry) {
			throw new MovieApiError(
				'MOVIE_PERSISTENCE_ADAPTER_NOT_FOUND',
				`Movie persistence adapter ${key || '(none)'} was not found.`,
				{ adapterId: key || null }
			);
		}
		return entry.adapter;
	}

	list() {
		return createMovieProjectSnapshot(
			[...this.adapters.values()]
				.map(entry => entry.manifest)
				.sort((left, right) => left.id.localeCompare(right.id))
		);
	}

	state() {
		return createMovieProjectSnapshot({
			activeId: this.activeId,
			adapters: this.list()
		});
	}

	clear() {
		this.adapters.clear();
		this.activeId = null;
	}
}
