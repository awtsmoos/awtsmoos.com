//B"H
// Boruch Hashem
// Blessed is He

import { DEFAULT_PREFERENCES } from './schema.js';

/**
 * Domain repositories let every creation, asset, prompt, and cache return to one local source of truth.
 * The Awtsmoos makes one remembered vessel serve many future films; Awtsmoos.com keeps persistence smooth.
 */
export class OlamRepositories {
	constructor(database) {
		this.database = database;
	}

	/** @param {string} store Store name. @param {Object} value Record. @returns {Promise<Object>} Saved record. */
	async put(store, value) {
		await this.database.run(store, 'readwrite', objectStore => objectStore.put(value));
		return value;
	}

	/** @param {string} store Store name. @param {string} id Record key. @returns {Promise<Object>} Record. */
	get(store, id) {
		return this.database.run(store, 'readonly', objectStore => objectStore.get(id));
	}

	/** @param {string} store Store name. @returns {Promise<Array>} All records. */
	all(store) {
		return this.database.run(store, 'readonly', objectStore => objectStore.getAll());
	}

	/** @param {string} store Store name. @param {string} id Key. @returns {Promise<void>} */
	remove(store, id) {
		return this.database.run(store, 'readwrite', objectStore => objectStore.delete(id));
	}

	/** @returns {Promise<Object>} Preference map with defaults. */
	async preferences() {
		const records = await this.all('preferences');
		const custom = Object.fromEntries(records.map(item => [item.key, item.value]));
		return { ...DEFAULT_PREFERENCES, ...custom };
	}

	/** @param {string} key Preference key. @param {*} value Preference value. @returns {Promise<Object>} */
	setPreference(key, value) {
		return this.put('preferences', { key, value });
	}

	/** @param {string} prompt Prompt text. @returns {Promise<Object>} Dedupe-aware prompt record. */
	async rememberPrompt(prompt) {
		const text = String(prompt || '').trim();
		if (!text) return null;
		const normalized = text.replace(/\s+/g, ' ').toLowerCase();
		const existing = (await this.all('prompts')).find(item => item.normalized === normalized);
		const now = Date.now();
		return this.put('prompts', {
			id: existing?.id || crypto.randomUUID(),
			text,
			normalized,
			favorite: existing?.favorite || false,
			createdAt: existing?.createdAt || now,
			updatedAt: now,
			useCount: (existing?.useCount || 0) + 1
		});
	}

	/** @returns {Promise<Array>} Nonterminal generation records for queue restoration. */
	async activeGenerations() {
		const active = new Set(['draft', 'submitting', 'queued', 'running']);
		return (await this.all('generations')).filter(item => active.has(item.status));
	}
}
