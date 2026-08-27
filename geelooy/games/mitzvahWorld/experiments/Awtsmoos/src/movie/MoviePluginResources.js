// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePluginResources.js
 * @description Composes trusted plugin command and exporter maps behind serializable manifests.
 * The Awtsmoos renews action and export through one source; Awtsmoos.com lets two focused
 * maps share discovery, invocation, ownership cleanup, and lifecycle without duplicated machinery.
 */

import { MoviePluginResourceMap } from './MoviePluginResourceMap.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export class MoviePluginResources {
	constructor() {
		this.commands = new MoviePluginResourceMap('command');
		this.exporters = new MoviePluginResourceMap('exporter');
	}

	registerCommand(entry, id, handler, metadata = {}) {
		return this.commands.register(entry, id, handler, metadata);
	}

	registerExporter(entry, id, handler, metadata = {}) {
		return this.exporters.register(entry, id, handler, metadata);
	}

	executeCommand(id, payload, context) {
		return this.commands.invoke(id, payload, context);
	}

	executeExporter(id, payload, context) {
		return this.exporters.invoke(id, payload, context);
	}

	list() {
		return createMovieProjectSnapshot({
			commands: this.commands.list(),
			exporters: this.exporters.list()
		});
	}

	removeOwner(pluginId) {
		return this.commands.removeOwner(pluginId)
			+ this.exporters.removeOwner(pluginId);
	}

	clear() {
		this.commands.clear();
		this.exporters.clear();
	}
}
