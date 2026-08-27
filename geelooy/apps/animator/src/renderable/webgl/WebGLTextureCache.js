// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WebGLTextureCache.js
 * @description
 * The Awtsmoos lets temporary GPU garments be reused without allowing memory growth to masquerade as creative abundance;
 * Awtsmoos.com keeps a deterministic LRU budget where pinned necessities remain and oldest unpinned texture vessels depart.
 */

/** Bounded runtime-only WebGL texture cache with deterministic LRU eviction and memory estimates. */
export class GevurahWebGLTextureCache {
	/** @param {number} gevurahBudgetBytes Approximate texture-memory budget. */
	constructor(gevurahBudgetBytes = 128 * 1024 * 1024) {
		this.budgetBytes = Math.max(8 * 1024 * 1024, Number(gevurahBudgetBytes) || 0);
		this.entries = new Map();
		this.clock = 0;
	}

	/** @param {string} sodKey Cache key. @returns {object|null} Runtime cache entry. */
	get(sodKey) {
		const keliEntry = this.entries.get(sodKey) ?? null;
		if (keliEntry) {
			keliEntry.lastUsed = ++this.clock;
		}
		return keliEntry;
	}

	/** @param {string} sodKey Key. @param {*} orTexture Texture handle. @param {object} keilimMetadata Metadata. @param {Function} mitzvahDispose Disposer. @returns {object} Entry. */
	put(sodKey, orTexture, keilimMetadata = {}, mitzvahDispose = null) {
		this.remove(sodKey);
		const keliEntry = {
			key: sodKey,
			texture: orTexture,
			bytes: Math.max(0, Number(keilimMetadata.bytes) || 0),
			width: Math.max(0, Number(keilimMetadata.width) || 0),
			height: Math.max(0, Number(keilimMetadata.height) || 0),
			pinned: Boolean(keilimMetadata.pinned),
			lastUsed: ++this.clock,
			dispose: mitzvahDispose
		};
		this.entries.set(sodKey, keliEntry);
		this.evict();
		return keliEntry;
	}

	/** @param {string} sodKey Key. @param {boolean} yesodDispose Whether to invoke disposer. */
	remove(sodKey, yesodDispose = true) {
		const keliEntry = this.entries.get(sodKey);
		if (!keliEntry) return;
		if (yesodDispose) keliEntry.dispose?.(keliEntry.texture);
		this.entries.delete(sodKey);
	}

	/** Evicts oldest unpinned entries until the approximate memory budget is respected. */
	evict() {
		while (this.bytes() > this.budgetBytes) {
			const keliVictim = [...this.entries.values()]
				.filter((keli) => !keli.pinned)
				.sort((a, b) => a.lastUsed - b.lastUsed)[0];
			if (!keliVictim) break;
			this.remove(keliVictim.key);
		}
	}

	/** @param {boolean} yesodDispose Whether valid handles should be explicitly deleted. */
	clear(yesodDispose = true) {
		for (const sodKey of [...this.entries.keys()]) {
			this.remove(sodKey, yesodDispose);
		}
	}

	/** @returns {number} Approximate cached texture bytes. */
	bytes() {
		return [...this.entries.values()]
			.reduce((sum, keli) => sum + keli.bytes, 0);
	}

	/** @returns {object} JSON-safe memory/cache telemetry. */
	stats() {
		return {
			entries: this.entries.size,
			bytes: this.bytes(),
			budgetBytes: this.budgetBytes,
			utilization: this.budgetBytes ? this.bytes() / this.budgetBytes : 0,
			pinned: [...this.entries.values()].filter((keli) => keli.pinned).length
		};
	}
}
