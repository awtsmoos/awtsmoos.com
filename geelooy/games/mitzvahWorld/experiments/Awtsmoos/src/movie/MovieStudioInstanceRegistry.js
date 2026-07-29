// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioInstanceRegistry.js
 * @description Owns local studio sessions behind stable IDs and immutable serializable metadata.
 * The Awtsmoos renews every editor without dividing the source; Awtsmoos.com lets many
 * finite studios coexist while only one active convenience alias points to a trusted local API.
 */

import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { createMovieRuntimeId } from './MovieRuntimeId.js';

export class MovieStudioInstanceRegistry {
	constructor() {
		this.instances = new Map();
		this.activeId = null;
	}

	register(session, options = {}) {
		if (session.instanceId && this.instances.has(session.instanceId)) {
			return session.instanceId;
		}
		const id = String(options.id || createMovieRuntimeId('studio'));
		if (this.instances.has(id)) {
			throw new MovieApiError(
				'DUPLICATE_MOVIE_STUDIO_INSTANCE',
				`Movie studio instance ${id} is already registered.`,
				{ instanceId: id }
			);
		}
		session.instanceId = id;
		this.instances.set(id, session);
		if (!this.activeId || options.activate !== false) this.activate(id);
		return id;
	}

	activate(id) {
		const session = this.resolveTrusted(id);
		this.activeId = session.instanceId;
		globalThis.AwtsmoosMovie = session.publicApi;
		return this.state();
	}

	publish(session) {
		if (!session?.instanceId || !this.instances.has(session.instanceId)) {
			return session?.publicApi || null;
		}
		if (!this.activeId) this.activeId = session.instanceId;
		if (this.activeId === session.instanceId) {
			globalThis.AwtsmoosMovie = session.publicApi;
		}
		return session.publicApi;
	}

	unregister(id) {
		const key = String(id);
		const removed = this.instances.delete(key);
		if (!removed) return false;
		if (this.activeId === key) {
			this.activeId = this.instances.keys().next().value || null;
			if (this.activeId) {
				globalThis.AwtsmoosMovie = this.instances.get(this.activeId).publicApi;
			} else if (globalThis.AwtsmoosMovie) {
				delete globalThis.AwtsmoosMovie;
			}
		}
		return true;
	}

	resolveTrusted(id) {
		const key = String(id);
		const session = this.instances.get(key);
		if (!session) {
			throw new MovieApiError(
				'MOVIE_STUDIO_INSTANCE_NOT_FOUND',
				`Movie studio instance ${key} was not found.`,
				{ instanceId: key }
			);
		}
		return session;
	}

	list() {
		return createMovieProjectSnapshot(
			[...this.instances.values()]
				.map(session => instanceMetadata(session, this.activeId))
				.sort((left, right) => left.id.localeCompare(right.id))
		);
	}

	state() {
		return createMovieProjectSnapshot({
			activeId: this.activeId,
			instances: this.list()
		});
	}

	clear() {
		this.instances.clear();
		this.activeId = null;
		if (globalThis.AwtsmoosMovie) delete globalThis.AwtsmoosMovie;
	}
}

export const movieStudioInstanceRegistry = new MovieStudioInstanceRegistry();

function instanceMetadata(session, activeId) {
	return {
		active: session.instanceId === activeId,
		id: session.instanceId,
		ready: !session.destroyed,
		revision: Number(session.revision || 0),
		title: String(session.project?.title || '')
	};
}
