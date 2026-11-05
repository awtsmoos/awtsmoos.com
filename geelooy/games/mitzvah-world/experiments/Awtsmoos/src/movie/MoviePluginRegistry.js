// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePluginRegistry.js
 * @description Coordinates trusted plugins, resources, runtime adapters, lookup, and serializable state.
 * The Awtsmoos renews extension through many bounded vessels; Awtsmoos.com keeps this
 * registry small while lifecycle and resource modules own activation, rollback, handlers, and cleanup.
 */

import { MovieApiError } from './MovieApiError.js';
import {
	registerMoviePlugin,
	unregisterMoviePlugin
} from './MoviePluginLifecycle.js';
import { MoviePluginResources } from './MoviePluginResources.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export class MoviePluginRegistry {
	constructor(session, runtimeAdapters) {
		this.session = session;
		this.runtimeAdapters = runtimeAdapters;
		this.plugins = new Map();
		this.resources = new MoviePluginResources();
	}

	register(manifest, implementation = {}) {
		return registerMoviePlugin(this, manifest, implementation);
	}

	unregister(id, options = {}) {
		return unregisterMoviePlugin(this, id, options);
	}

	get(id) {
		const key = String(id);
		const entry = this.plugins.get(key);
		if (!entry) {
			throw new MovieApiError(
				'MOVIE_PLUGIN_NOT_FOUND',
				`Movie plugin ${key} was not found.`,
				{ pluginId: key }
			);
		}
		return entry;
	}

	list() {
		return createMovieProjectSnapshot({
			plugins: [...this.plugins.values()]
				.map(entry => entry.manifest)
				.sort((left, right) => left.id.localeCompare(right.id)),
			resources: this.resources.list()
		});
	}

	registerCommand(entry, id, handler, metadata) {
		return this.resources.registerCommand(entry, id, handler, metadata);
	}

	registerExporter(entry, id, handler, metadata) {
		return this.resources.registerExporter(entry, id, handler, metadata);
	}

	registerRuntimeAdapter(entry, manifest, adapter) {
		return this.runtimeAdapters.register({
			...manifest,
			ownerPluginId: entry.manifest.id
		}, adapter);
	}

	executeCommand(id, payload) {
		const entry = this.get(pluginIdFromResource(id));
		return this.resources.executeCommand(id, payload, entry.context);
	}

	executeExporter(id, payload) {
		const entry = this.get(pluginIdFromResource(id));
		return this.resources.executeExporter(id, payload, entry.context);
	}

	async clear() {
		for (const id of [...this.plugins.keys()]) {
			await this.unregister(id);
		}
		this.resources.clear();
	}
}

function pluginIdFromResource(id) {
	return String(id).split(':')[0];
}
