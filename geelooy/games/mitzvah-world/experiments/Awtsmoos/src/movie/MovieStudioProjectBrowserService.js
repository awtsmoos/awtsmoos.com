// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectBrowserService.js
 * @description Performs verified save, restore, duplicate, removal, autosave, and export operations.
 * The Awtsmoos renews remembered project beyond any storage vessel; Awtsmoos.com keeps
 * checksums, adapters, undoable restoration, and detached duplication inside one service boundary.
 */

import {
	listMovieStudioPersistence,
	loadMovieStudioPersistence,
	removeMovieStudioPersistence,
	saveMovieStudioPersistence
} from './MoviePersistenceOperations.js';
import { createMoviePersistenceRecord } from './MoviePersistenceRecord.js';

export class MovieStudioProjectBrowserService {
	constructor(session) {
		this.session = session;
	}

	async save(adapterId, key) {
		return saveMovieStudioPersistence(this.session, {
			adapterId,
			key,
			metadata: { source: 'project-browser' }
		});
	}

	async list(adapterId) {
		return (await listMovieStudioPersistence(this.session, { adapterId })).records;
	}

	async restore(adapterId, key) {
		return loadMovieStudioPersistence(this.session, {
			adapterId,
			key,
			label: `Restore saved movie ${key}`
		});
	}

	async remove(adapterId, key) {
		return removeMovieStudioPersistence(this.session, { adapterId, key });
	}

	async duplicate(adapterId, key) {
		const adapter = this.session.persistence.get(adapterId);
		const source = await adapter.load(key);
		const copyKey = uniqueCopyKey(key, await adapter.list());
		const record = createMoviePersistenceRecord(
			source.project.project,
			source.ui,
			{
				key: copyKey,
				metadata: { ...source.metadata, duplicatedFrom: key },
				projectMetadata: source.project.metadata,
				revision: source.project.revision
			}
		);
		await adapter.save(record);
		return { adapterId, key: copyKey };
	}

	async export(adapterId, key) {
		const record = await this.session.persistence.get(adapterId).load(key);
		return JSON.stringify(record.project.project, null, 2);
	}

	toggleAutosave(adapterId, key) {
		const state = this.session.autosave.state();
		if (state.active) return {
			active: false,
			state: this.session.autosave.stop()
		};
		return {
			active: true,
			state: this.session.autosave.start({
				adapterId,
				debounceMs: 750,
				key,
				saveImmediately: true
			})
		};
	}
}

function uniqueCopyKey(key, records) {
	const used = new Set(records.map(record => record.key));
	let candidate = `${key}-copy`;
	let index = 2;
	while (used.has(candidate)) {
		candidate = `${key}-copy-${index}`;
		index += 1;
	}
	return candidate;
}
