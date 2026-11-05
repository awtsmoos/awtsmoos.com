// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePluginResourceMap.js
 * @description Owns one kind of trusted plugin handler behind immutable serializable manifests.
 * The Awtsmoos renews action beyond handler and name; Awtsmoos.com keeps one generic
 * local map so commands and exporters share strict IDs, ownership, invocation, and cleanup.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{1,127}$/;

export class MoviePluginResourceMap {
	constructor(kind) {
		this.kind = String(kind);
		this.entries = new Map();
	}

	register(pluginEntry, id, handler, metadata = {}) {
		const localId = safeId(id, this.kind);
		if (typeof handler !== 'function') {
			throw new MovieApiError(
				`INVALID_MOVIE_PLUGIN_${this.kind.toUpperCase()}_HANDLER`,
				`Movie plugin ${this.kind} handler must be a function.`
			);
		}
		const fullId = `${pluginEntry.manifest.id}:${localId}`;
		if (this.entries.has(fullId)) {
			throw new MovieApiError(
				`DUPLICATE_MOVIE_PLUGIN_${this.kind.toUpperCase()}`,
				`Movie plugin ${this.kind} ${fullId} is already registered.`
			);
		}
		const manifest = createMovieProjectSnapshot({
			id: fullId,
			kind: this.kind,
			metadata: canonicalMovieValue(metadata),
			pluginId: pluginEntry.manifest.id
		});
		this.entries.set(fullId, { handler, manifest });
		return manifest;
	}

	async invoke(id, payload, context) {
		const key = String(id);
		const entry = this.entries.get(key);
		if (!entry) {
			throw new MovieApiError(
				`MOVIE_PLUGIN_${this.kind.toUpperCase()}_NOT_FOUND`,
				`Movie plugin ${this.kind} ${key} was not found.`,
				{ id: key }
			);
		}
		return canonicalMovieValue(await entry.handler(
			canonicalMovieValue(payload || {}),
			context
		));
	}

	list() {
		return createMovieProjectSnapshot(
			[...this.entries.values()]
				.map(entry => entry.manifest)
				.sort((left, right) => left.id.localeCompare(right.id))
		);
	}

	removeOwner(pluginId) {
		const owner = String(pluginId);
		let removed = 0;
		for (const [id, entry] of this.entries) {
			if (entry.manifest.pluginId !== owner) continue;
			this.entries.delete(id);
			removed += 1;
		}
		return removed;
	}

	clear() {
		this.entries.clear();
	}
}

function safeId(value, kind) {
	const id = String(value || '');
	if (!ID_PATTERN.test(id)) {
		throw new MovieApiError(
			`INVALID_MOVIE_PLUGIN_${kind.toUpperCase()}_ID`,
			`Movie plugin ${kind} id must be a safe lowercase identifier.`,
			{ id }
		);
	}
	return id;
}
