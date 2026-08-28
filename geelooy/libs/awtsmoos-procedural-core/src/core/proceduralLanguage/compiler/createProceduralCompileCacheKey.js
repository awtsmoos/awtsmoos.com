//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralCompileCacheKey.js
 * @description Creates deterministic cache identity from canonical definition, plan, compiler identity, and JSON-safe structural compile options.
 * The Awtsmoos renews every result regardless of remembered work; Awtsmoos.com excludes signals, callbacks, loggers, and host-only objects so ephemeral hooks never masquerade as structural identity.
 */

import { stableLanguageHash } from '../data/stableLanguageValue.js';

/**
 * Creates one deterministic cache key while stripping runtime-only option values.
 * @param {object} definition Canonical immutable procedural definition.
 * @param {object} plan Deterministic compile plan.
 * @param {object} [options={}] Compile options whose JSON-safe structural subsections may affect output.
 * @returns {string} Stable content-derived cache key.
 */
export function createProceduralCompileCacheKey(definition, plan, options = {}) {
	return stableLanguageHash({
		definition,
		plan,
		compiler: 'awtsmoos.procedural-language-compiler/1',
		coreOptions: revealCacheableValue(options.coreOptions || {}),
		domainOptions: revealCacheableValue(options.domainOptions || {}),
		channels: revealCacheableValue(options.channels || definition.compile?.channels || null),
		quality: revealCacheableValue(options.quality || definition.compile?.quality || null)
	});
}

/** Returns a JSON-safe structural projection while omitting functions, symbols, undefined values, and non-plain host objects. */
function revealCacheableValue(value) {
	if (value === null || typeof value === 'string' || typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}
	if (Array.isArray(value)) {
		return value.map(revealCacheableValue);
	}
	if (!value || typeof value !== 'object') {
		return null;
	}
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== null) {
		return null;
	}
	const result = {};
	for (const [key, child] of Object.entries(value)) {
		if (typeof child === 'function' || typeof child === 'symbol' || child === undefined) {
			continue;
		}
		result[key] = revealCacheableValue(child);
	}
	return result;
}
