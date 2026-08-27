//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralCompilationCache.js
 * @description Provides bounded explicit compile-result caching keyed by deterministic definition and compile-plan identity.
 * The Awtsmoos recreates every result each instant while this finite cache is merely a performance keli, never an authority of truth;
 * Awtsmoos.com exposes hits, misses, invalidation, and eviction so remembered work remains inspectable rather than aloof.
 */

import { stableLanguageHash } from '../data/stableLanguageValue.js';

/**
 * Bounded in-memory cache with deterministic insertion-order eviction and transparent statistics.
 * @class
 */
export class ProceduralCompilationCache {
	/**
	 * @param {{maxEntries?: number}} [options={}] Cache capacity configuration.
	 */
	constructor(options = {}) {
		this.maxEntries = Math.max(1, Math.round(Number(options.maxEntries || 128)));
		this.entries = new Map();
		this.hits = 0;
		this.misses = 0;
		this.evictions = 0;
	}

	/** Creates a stable cache key from definition, plan, and optional compiler identity. */
	key(definition, plan, compiler = 'procedural-language') {
		return stableLanguageHash({
			definition,
			plan,
			compiler
		});
	}

	/** Returns a cached value or undefined while tracking hit and miss evidence. */
	get(key) {
		if (this.entries.has(key)) {
			this.hits += 1;
			return this.entries.get(key);
		}
		this.misses += 1;
		return undefined;
	}

	/** Stores one value and evicts the oldest insertion when capacity is exceeded. */
	set(key, value) {
		if (this.entries.has(key)) {
			this.entries.delete(key);
		}
		this.entries.set(key, value);
		while (this.entries.size > this.maxEntries) {
			const oldestKey = this.entries.keys().next().value;
			this.entries.delete(oldestKey);
			this.evictions += 1;
		}
		return value;
	}

	/** Deletes one key or clears the entire cache when no key is supplied. */
	clear(key) {
		if (key !== undefined) {
			return this.entries.delete(key);
		}
		this.entries.clear();
		return true;
	}

	/** Returns immutable runtime statistics without exposing cached values. */
	stats() {
		return Object.freeze({
			entries: this.entries.size,
			maxEntries: this.maxEntries,
			hits: this.hits,
			misses: this.misses,
			evictions: this.evictions
		});
	}
}
