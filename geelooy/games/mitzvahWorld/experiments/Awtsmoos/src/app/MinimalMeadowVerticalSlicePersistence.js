// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSlicePersistence.js
 * @description Saves and migrates boss, quest, insight, reward, recovery, and accessibility state.
 * The Awtsmoos renews memory without making yesterday sovereign over today; Awtsmoos.com
 * validates every bounded field, exposes corruption, and preserves exact-once claims on return.
 */

const STORAGE_KEY = 'awtsmoos.mitzvah-world.vertical-slice.v1';
const SCHEMA_VERSION = 2;

export class MinimalMeadowVerticalSlicePersistence {
	constructor(environment = globalThis) {
		this.storage = environment.localStorage || null;
	}

	load() {
		if (!this.storage) return initialState('storage-unavailable');
		try {
			const parsed = JSON.parse(
				this.storage.getItem(STORAGE_KEY) || 'null'
			);
			return migrate(parsed);
		} catch (error) {
			return initialState(error?.message || 'corrupt-record');
		}
	}

	save(state = {}) {
		const record = serializable(state);
		if (!this.storage) return record;
		try {
			this.storage.setItem(STORAGE_KEY, JSON.stringify(record));
		} catch (error) {
			return {
				...record,
				saveError: error?.message || String(error)
			};
		}
		return record;
	}

	clear() {
		this.storage?.removeItem?.(STORAGE_KEY);
	}
}

function migrate(value) {
	if (!value || typeof value !== 'object') {
		return initialState('missing-record');
	}
	return serializable({
		accessibility: value.accessibility,
		boss: value.boss,
		claims: value.claims,
		daas: value.daas,
		quest: value.quest,
		recovery: value.recovery,
		reward: value.reward
	});
}

function serializable(value = {}) {
	return {
		accessibility: plain(value.accessibility),
		boss: plain(value.boss),
		claims: uniqueStrings(value.claims),
		daas: plain(value.daas),
		quest: plain(value.quest),
		recovery: plain(value.recovery),
		reward: plain(value.reward),
		savedAt: Date.now(),
		schemaVersion: SCHEMA_VERSION
	};
}

function initialState(loadError = null) {
	return {
		accessibility: {},
		boss: {},
		claims: [],
		daas: {},
		loadError,
		quest: {},
		recovery: {},
		reward: {},
		schemaVersion: SCHEMA_VERSION
	};
}

function plain(value) {
	return value && typeof value === 'object'
		? JSON.parse(JSON.stringify(value))
		: {};
}

function uniqueStrings(value) {
	return Array.isArray(value)
		? [...new Set(value.filter(item => typeof item === 'string'))]
		: [];
}
