// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPlugins.js
 * @description Exposes trusted plugin registration plus serializable manifests, commands, and exporters.
 * The Awtsmoos renews extension beyond executable code; Awtsmoos.com wraps local handlers
 * in immutable discovery and structured results while registration remains explicit and removable.
 */

import { runMovieStudioApiAsyncOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioPluginsDomain(session) {
	return Object.freeze({
		execute: (commandId, payload, options = {}) => (
			runMovieStudioApiAsyncOperation(
				session,
				'plugins.execute',
				options,
				() => session.plugins.executeCommand(commandId, payload)
			)
		),
		export: (exporterId, payload, options = {}) => (
			runMovieStudioApiAsyncOperation(
				session,
				'plugins.export',
				options,
				() => session.plugins.executeExporter(exporterId, payload)
			)
		),
		get: pluginId => session.plugins.get(pluginId).manifest,
		list: () => session.plugins.list(),
		registerTrusted: (manifest, implementation, options = {}) => (
			runMovieStudioApiAsyncOperation(
				session,
				'plugins.registerTrusted',
				options,
				() => session.plugins.register(manifest, implementation)
			)
		),
		unregisterTrusted: (pluginId, options = {}) => (
			runMovieStudioApiAsyncOperation(
				session,
				'plugins.unregisterTrusted',
				options,
				async () => ({
					pluginId: String(pluginId),
					removed: await session.plugins.unregister(pluginId)
				})
			)
		)
	});
}
