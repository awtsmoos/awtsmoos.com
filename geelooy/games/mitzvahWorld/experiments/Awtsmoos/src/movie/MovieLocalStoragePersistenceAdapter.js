// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieLocalStoragePersistenceAdapter.js
 * @description Stores canonical persistence records under one bounded local-storage namespace.
 * The Awtsmoos renews memory beyond browser quota and privacy; Awtsmoos.com uses storage
 * only when granted, names each key explicitly, and returns detached verified records.
 */

import { MovieApiError } from './MovieApiError.js';
import {
	parseMoviePersistenceRecord,
	serializeMoviePersistenceRecord
} from './MoviePersistenceRecord.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export class MovieLocalStoragePersistenceAdapter {
	constructor(options = {}) {
		this.id = String(options.id || 'localStorage');
		this.prefix = String(options.prefix || 'awtsmoos.movie.persistence.v1.');
		this.storage = options.storage || resolveStorage();
	}

	async save(record) {
		const parsed = parseMoviePersistenceRecord(record);
		const text = serializeMoviePersistenceRecord(
			parsed.project.project,
			parsed.ui,
			{
				key: parsed.key,
				metadata: parsed.metadata,
				projectMetadata: parsed.project.metadata,
				revision: parsed.project.revision,
				savedAt: parsed.savedAt
			}
		);
		this.requireStorage().setItem(this.key(parsed.key), text);
		return createMovieProjectSnapshot({
			adapterId: this.id,
			key: parsed.key,
			savedAt: parsed.savedAt
		});
	}

	async load(key) {
		const id = String(key);
		const text = this.requireStorage().getItem(this.key(id));
		if (!text) {
			throw new MovieApiError(
				'MOVIE_PERSISTENCE_RECORD_NOT_FOUND',
				`Movie persistence record ${id} was not found.`,
				{ adapterId: this.id, key: id }
			);
		}
		return parseMoviePersistenceRecord(text);
	}

	async remove(key) {
		this.requireStorage().removeItem(this.key(key));
		return true;
	}

	async list() {
		const storage = this.requireStorage();
		const items = [];
		for (let index = 0; index < storage.length; index += 1) {
			const key = storage.key(index);
			if (!key?.startsWith(this.prefix)) continue;
			const record = parseMoviePersistenceRecord(storage.getItem(key));
			items.push({
				key: record.key,
				metadata: record.metadata,
				revision: record.project.revision,
				savedAt: record.savedAt,
				title: record.project.project.title
			});
		}
		return createMovieProjectSnapshot(
			items.sort((left, right) => left.key.localeCompare(right.key))
		);
	}

	key(value) {
		return `${this.prefix}${encodeURIComponent(String(value))}`;
	}

	requireStorage() {
		if (!this.storage) {
			throw new MovieApiError(
				'MOVIE_LOCAL_STORAGE_UNAVAILABLE',
				'Browser local storage is unavailable for movie persistence.'
			);
		}
		return this.storage;
	}
}

function resolveStorage() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}
