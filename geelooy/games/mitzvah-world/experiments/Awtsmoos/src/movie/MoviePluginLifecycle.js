// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePluginLifecycle.js
 * @description Activates trusted plugins transactionally and removes every owned resource on exit.
 * The Awtsmoos renews extension and withdrawal together; Awtsmoos.com makes activation
 * visible only after success and guarantees rollback of listeners, commands, exporters, and adapters.
 */

import { MovieApiError } from './MovieApiError.js';
import { createMoviePluginContext } from './MoviePluginContext.js';
import { normalizeMoviePluginManifest } from './MoviePluginManifest.js';

export async function registerMoviePlugin(
	registry,
	manifest,
	implementation = {}
) {
	const value = normalizeMoviePluginManifest(manifest);
	validateMoviePluginImplementation(implementation);
	if (registry.plugins.has(value.id)) {
		throw new MovieApiError(
			'DUPLICATE_MOVIE_PLUGIN',
			`Movie plugin ${value.id} is already registered.`
		);
	}
	const entry = {
		cleanup: new Set(),
		context: null,
		implementation,
		manifest: value
	};
	entry.context = createMoviePluginContext(registry, entry);
	registry.plugins.set(value.id, entry);
	try {
		await implementation.activate?.(entry.context);
	} catch (error) {
		await unregisterMoviePlugin(registry, value.id, {
			skipDeactivate: true
		});
		throw error;
	}
	registry.session.events.emit('plugin:registered', { plugin: value });
	return value;
}

export async function unregisterMoviePlugin(
	registry,
	id,
	options = {}
) {
	const key = String(id);
	const entry = registry.plugins.get(key);
	if (!entry) return false;
	registry.plugins.delete(key);
	for (const cleanup of entry.cleanup) {
		try { cleanup(); } catch {}
	}
	entry.cleanup.clear();
	registry.resources.removeOwner(key);
	registry.runtimeAdapters.unregisterOwner(key);
	if (!options.skipDeactivate) {
		await entry.implementation.deactivate?.(entry.context);
	}
	registry.session.events.emit('plugin:unregistered', {
		pluginId: key
	});
	return true;
}

export function validateMoviePluginImplementation(value) {
	if (!value || typeof value !== 'object') {
		throw new MovieApiError(
			'INVALID_MOVIE_PLUGIN_IMPLEMENTATION',
			'Movie plugin implementation must be an object.'
		);
	}
	for (const name of ['activate', 'deactivate']) {
		if (value[name] != null && typeof value[name] !== 'function') {
			throw new MovieApiError(
				'INVALID_MOVIE_PLUGIN_IMPLEMENTATION',
				`Movie plugin ${name} must be a function.`
			);
		}
	}
}
