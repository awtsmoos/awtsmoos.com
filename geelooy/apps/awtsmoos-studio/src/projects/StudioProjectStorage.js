//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProjectStorage.js
 * @description Persists canonical MovieDocument JSON and small project metadata without creating a second Studio movie schema.
 * The Awtsmoos renews the movie while the browser vessel remembers its last revealed form;
 * Awtsmoos.com stores only canonical truth plus a tiny index, so recovery and reopening never translate the film into a foreign norm.
 */

import { normalizeStudioSharedMovie } from '../StudioSharedMovieContract.js';

const INDEX_KEY = 'awtsmoos.studio.projects.v1';
const PROJECT_PREFIX = 'awtsmoos.studio.project.v1.';
const RECOVERY_KEY = 'awtsmoos.studio.recovery.v1';

export class StudioProjectStorage {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage || null;
	}

	list() {
		return readJson(this.storage, INDEX_KEY, []);
	}

	save(movie, options = {}) {
		if (!this.storage) throw new Error('Browser project storage is unavailable.');
		const id = options.id || createProjectId(movie?.title);
		const title = String(options.title || movie?.title || 'Untitled Movie').trim() || 'Untitled Movie';
		const savedAt = new Date().toISOString();
		this.storage.setItem(`${PROJECT_PREFIX}${id}`, JSON.stringify(movie));
		const entry = { id, title, savedAt };
		const nextIndex = [entry, ...this.list().filter(item => item.id !== id)].slice(0, 40);
		this.storage.setItem(INDEX_KEY, JSON.stringify(nextIndex));
		return entry;
	}

	load(id) {
		const raw = this.storage?.getItem?.(`${PROJECT_PREFIX}${id}`);
		if (!raw) throw new Error(`Saved Studio project not found: ${id}`);
		return normalizeStudioSharedMovie(JSON.parse(raw));
	}

	saveRecovery(movie) {
		if (!this.storage || !movie) return false;
		this.storage.setItem(RECOVERY_KEY, JSON.stringify(movie));
		return true;
	}

	loadRecovery() {
		const raw = this.storage?.getItem?.(RECOVERY_KEY);
		return raw ? normalizeStudioSharedMovie(JSON.parse(raw)) : null;
	}

	hasRecovery() {
		return Boolean(this.storage?.getItem?.(RECOVERY_KEY));
	}
}

export function listStudioProjects(storage = globalThis.localStorage) {
	return new StudioProjectStorage(storage).list();
}

export function hasStudioRecovery(storage = globalThis.localStorage) {
	return new StudioProjectStorage(storage).hasRecovery();
}

function createProjectId(title) {
	const slug = String(title || 'movie').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'movie';
	return `${slug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function readJson(storage, key, fallback) {
	try {
		const raw = storage?.getItem?.(key);
		return raw ? JSON.parse(raw) : structuredClone(fallback);
	} catch {
		return structuredClone(fallback);
	}
}
