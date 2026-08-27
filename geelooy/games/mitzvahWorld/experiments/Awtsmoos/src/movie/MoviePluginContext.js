// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePluginContext.js
 * @description Gives one trusted plugin only the capabilities declared in its serializable manifest.
 * The Awtsmoos renews extension and boundary together; Awtsmoos.com lets local code act
 * through explicit permissions while every subscription, command, exporter, and adapter is tracked.
 */

import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMoviePluginContext(registry, entry) {
	return Object.freeze({
		executeCommand: (request, options) => {
			requirePermission(entry, 'commands.execute');
			return registry.session.publicApi.commands.execute(request, options);
		},
		getProject: () => {
			requirePermission(entry, 'project.read');
			return createMovieProjectSnapshot(registry.session.project);
		},
		plugin: entry.manifest,
		registerCommand: (id, handler, metadata = {}) => {
			requirePermission(entry, 'commands.register');
			return registry.registerCommand(entry, id, handler, metadata);
		},
		registerExporter: (id, handler, metadata = {}) => {
			requirePermission(entry, 'exporters.register');
			return registry.registerExporter(entry, id, handler, metadata);
		},
		registerRuntimeAdapter: (manifest, adapter) => {
			requirePermission(entry, 'runtime.adapters.register');
			return registry.registerRuntimeAdapter(entry, manifest, adapter);
		},
		subscribe: (type, listener) => {
			requirePermission(entry, 'events.subscribe');
			if (typeof listener !== 'function') {
				throw new MovieApiError(
					'INVALID_MOVIE_PLUGIN_LISTENER',
					'Movie plugin event listener must be a function.'
				);
			}
			const unsubscribe = registry.session.events.on(type, listener);
			entry.cleanup.add(unsubscribe);
			return () => {
				entry.cleanup.delete(unsubscribe);
				unsubscribe();
			};
		}
	});
}

export function requireMoviePluginPermission(entry, permission) {
	return requirePermission(entry, permission);
}

function requirePermission(entry, permission) {
	if (!entry.manifest.permissions.includes(permission)) {
		throw new MovieApiError(
			'MOVIE_PLUGIN_PERMISSION_DENIED',
			`Plugin ${entry.manifest.id} lacks permission ${permission}.`,
			{ permission, pluginId: entry.manifest.id }
		);
	}
	return true;
}
