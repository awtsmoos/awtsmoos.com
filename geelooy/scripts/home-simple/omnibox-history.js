// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos remembers only a few chosen paths and Torah questions, keeping continuity bounded, local, and easy to release.

const STORAGE_KEY = "awtsmoos.home.omnibox.v1";
const EMPTY_STATE = Object.freeze({ worldIds: [], queries: [] });

export class OmniboxHistory {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
		this.memoryState = this.read();
	}

	getSnapshot() {
		return {
			worldIds: [...this.memoryState.worldIds],
			queries: [...this.memoryState.queries]
		};
	}

	hasEntries() {
		return this.memoryState.worldIds.length > 0
			|| this.memoryState.queries.length > 0;
	}

	recordWorld(worldId) {
		const normalizedId = String(worldId ?? "").trim();

		if (!normalizedId) {
			return;
		}

		this.memoryState.worldIds = this.prependUnique(
			this.memoryState.worldIds,
			normalizedId
		);
		this.persist();
	}

	recordQuery(query) {
		const normalizedQuery = String(query ?? "").trim();

		if (normalizedQuery.length < 2) {
			return;
		}

		this.memoryState.queries = this.prependUnique(
			this.memoryState.queries,
			normalizedQuery,
			value => value.toLocaleLowerCase()
		);
		this.persist();
	}

	clear() {
		this.memoryState = this.createEmptyState();

		try {
			this.storage?.removeItem(STORAGE_KEY);
		} catch {
			// The in-memory state is already cleared; unavailable storage is harmless.
		}
	}

	read() {
		try {
			const rawValue = this.storage?.getItem(STORAGE_KEY);

			if (!rawValue) {
				return this.createEmptyState();
			}

			const parsedValue = JSON.parse(rawValue);
			return {
				worldIds: this.cleanArray(parsedValue?.worldIds),
				queries: this.cleanArray(parsedValue?.queries)
			};
		} catch {
			return this.createEmptyState();
		}
	}

	persist() {
		try {
			this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.memoryState));
		} catch {
			// Memory continuity remains available when localStorage is blocked.
		}
	}

	prependUnique(values, nextValue, keySelector = value => value) {
		const nextKey = keySelector(nextValue);
		return [
			nextValue,
			...values.filter(value => keySelector(value) !== nextKey)
		].slice(0, 5);
	}

	cleanArray(value) {
		if (!Array.isArray(value)) {
			return [];
		}

		return value
			.filter(entry => typeof entry === "string" && entry.trim())
			.map(entry => entry.trim())
			.slice(0, 5);
	}

	createEmptyState() {
		return {
			worldIds: [...EMPTY_STATE.worldIds],
			queries: [...EMPTY_STATE.queries]
		};
	}
}
