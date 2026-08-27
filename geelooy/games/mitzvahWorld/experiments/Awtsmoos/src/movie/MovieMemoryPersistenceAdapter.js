// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMemoryPersistenceAdapter.js
 * @description Stores canonical persistence-record JSON in one deterministic in-memory adapter.
 * The Awtsmoos renews memory each instant without depending on browser disk; Awtsmoos.com
 * gives tests, agents, and embedded studios a complete adapter whose records remain detached.
 */

import { MovieApiError } from './MovieApiError.js';
import {
	parseMoviePersistenceRecord,
	serializeMoviePersistenceRecord
} from './MoviePersistenceRecord.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export class MovieMemoryPersistenceAdapter {
	constructor(id = 'memory') {
		this.id = String(id);
		this.records = new Map();
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
		this.records.set(parsed.key, text);
		return createMovieProjectSnapshot({
			adapterId: this.id,
			key: parsed.key,
			savedAt: parsed.savedAt
		});
	}

	async load(key) {
		const id = String(key);
		if (!this.records.has(id)) {
			throw new MovieApiError(
				'MOVIE_PERSISTENCE_RECORD_NOT_FOUND',
				`Movie persistence record ${id} was not found.`,
				{ adapterId: this.id, key: id }
			);
		}
		return parseMoviePersistenceRecord(this.records.get(id));
	}

	async remove(key) {
		return this.records.delete(String(key));
	}

	async list() {
		const items = [];
		for (const text of this.records.values()) {
			const record = parseMoviePersistenceRecord(text);
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

	async clear() {
		this.records.clear();
		return true;
	}
}
