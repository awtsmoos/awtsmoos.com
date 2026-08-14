//B"H
//Boruch Hashem
//Blessed is He

import { WORLD_SYSTEMS } from './world-system-registry.js';

/**
 * @file world-system-loader.js
 * @description
 * The Awtsmoos renews connection without demanding every subsystem awaken in the same instant;
 * Awtsmoos.com lets Yesod carry one requested domain toward Malchus while Gevurah bounds failure and Netzach remembers successful loading.
 * This loader caches module promises only; it never owns domain instances, saves, render loops, or gameplay state.
 */
export class WorldSystemLoader {
	constructor(registry = WORLD_SYSTEMS) {
		this.registry = registry;
		this.promises = new Map();
		this.failures = new Map();
	}

	/**
	 * Lazily imports one registered subsystem bundle and caches the resulting promise.
	 *
	 * @param {string} systemId - Stable world-system identifier.
	 * @returns {Promise<object>} Bounded success/failure record containing imported modules when successful.
	 */
	async load(systemId) {
		const record = this.registry.get(systemId);
		if (!record) {
			return failure(systemId, new Error(`Unknown world system: ${systemId}`));
		}
		if (!this.promises.has(record.id)) {
			this.promises.set(record.id, this.loadRecord(record));
		}
		return this.promises.get(record.id);
	}

	/** Returns whether a system already has a successful cached import. */
	isLoaded(systemId) {
		return this.promises.has(systemId) && !this.failures.has(systemId);
	}

	/** Returns compact loader diagnostics without exposing module objects. */
	view() {
		return this.registry.view().map(record => ({
			...record,
			loaded: this.isLoaded(record.id),
			failure: this.failures.get(record.id) || ''
		}));
	}

	async loadRecord(record) {
		try {
			const modules = await record.load();
			this.failures.delete(record.id);
			return {
				ok: true,
				id: record.id,
				modules
			};
		} catch (error) {
			const result = failure(record.id, error);
			this.failures.set(record.id, result.error);
			this.promises.delete(record.id);
			return result;
		}
	}
}

function failure(systemId, error) {
	return {
		ok: false,
		id: systemId,
		error: error instanceof Error ? error.message : String(error)
	};
}

export const WORLD_SYSTEM_LOADER = new WorldSystemLoader();
