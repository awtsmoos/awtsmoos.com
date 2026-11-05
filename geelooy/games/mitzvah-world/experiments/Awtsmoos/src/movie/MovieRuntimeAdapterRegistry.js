// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRuntimeAdapterRegistry.js
 * @description Owns trusted runtime adapters while exposing only immutable serializable manifests.
 * The Awtsmoos renews capability beyond every finite implementation; Awtsmoos.com keeps
 * live methods local while agents discover, invoke, and remove only explicitly named vessels.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import { normalizeMovieRuntimeAdapterManifest } from './MovieRuntimeAdapterManifest.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export class MovieRuntimeAdapterRegistry {
	constructor() {
		this.adapters = new Map();
	}

	register(manifest, adapter) {
		const value = normalizeMovieRuntimeAdapterManifest(manifest);
		validateAdapter(adapter, value);
		if (this.adapters.has(value.id)) {
			throw new MovieApiError(
				'DUPLICATE_MOVIE_RUNTIME_ADAPTER',
				`Movie runtime adapter ${value.id} is already registered.`,
				{ adapterId: value.id }
			);
		}
		this.adapters.set(value.id, { adapter, manifest: value });
		return value;
	}

	unregister(id) {
		return this.adapters.delete(String(id));
	}

	get(id) {
		const key = String(id);
		const entry = this.adapters.get(key);
		if (!entry) {
			throw new MovieApiError(
				'MOVIE_RUNTIME_ADAPTER_NOT_FOUND',
				`Movie runtime adapter ${key} was not found.`,
				{ adapterId: key }
			);
		}
		return entry;
	}

	list() {
		return createMovieProjectSnapshot(
			[...this.adapters.values()]
				.map(entry => entry.manifest)
				.sort((left, right) => left.id.localeCompare(right.id))
		);
	}

	state() {
		return createMovieProjectSnapshot({ adapters: this.list() });
	}

	async invoke(id, method, payload) {
		const entry = this.get(id);
		const name = String(method);
		if (!entry.manifest.capabilities.includes(name)) {
			throw new MovieApiError(
				'MOVIE_RUNTIME_ADAPTER_CAPABILITY_DENIED',
				`Runtime adapter ${entry.manifest.id} does not expose ${name}.`,
				{ adapterId: entry.manifest.id, capability: name }
			);
		}
		const handler = entry.adapter?.[name];
		if (typeof handler !== 'function') {
			throw new MovieApiError(
				'MOVIE_RUNTIME_ADAPTER_METHOD_MISSING',
				`Runtime adapter ${entry.manifest.id} is missing ${name}().`,
				{ adapterId: entry.manifest.id, capability: name }
			);
		}
		return canonicalMovieValue(await handler(
			canonicalMovieValue(payload || {})
		));
	}

	unregisterOwner(pluginId) {
		const owner = String(pluginId);
		let removed = 0;
		for (const [id, entry] of this.adapters) {
			if (entry.manifest.ownerPluginId !== owner) continue;
			this.adapters.delete(id);
			removed += 1;
		}
		return removed;
	}

	clear() {
		this.adapters.clear();
	}
}

function validateAdapter(adapter, manifest) {
	if (!adapter || typeof adapter !== 'object') {
		throw new MovieApiError(
			'INVALID_MOVIE_RUNTIME_ADAPTER',
			'Movie runtime adapter implementation must be an object.'
		);
	}
	for (const capability of manifest.capabilities) {
		if (typeof adapter[capability] !== 'function') {
			throw new MovieApiError(
				'INVALID_MOVIE_RUNTIME_ADAPTER',
				`Runtime adapter requires ${capability}().`,
				{ capability, adapterId: manifest.id }
			);
		}
	}
}
