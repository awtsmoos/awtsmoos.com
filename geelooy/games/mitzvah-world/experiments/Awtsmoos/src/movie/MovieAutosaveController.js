// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAutosaveController.js
 * @description Debounces project and UI events into verified persistence saves with explicit lifecycle.
 * The Awtsmoos renews every change without anxiety over loss; Awtsmoos.com gathers finite
 * edits into one bounded save, exposes its state, and releases timers and subscriptions on command.
 */

import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { saveMovieStudioPersistence } from './MoviePersistenceOperations.js';

export class MovieAutosaveController {
	constructor(session) {
		this.session = session;
		this.active = false;
		this.options = null;
		this.timer = null;
		this.unsubscribe = [];
		this.lastSavedRevision = null;
		this.lastError = null;
	}

	start(options = {}) {
		this.stop();
		this.options = normalizeOptions(options);
		this.active = true;
		this.unsubscribe = [
			this.session.events.on('project:changed', () => this.schedule()),
			this.session.events.on('ui:preferences', () => this.schedule())
		];
		if (this.options.saveImmediately) this.schedule(0);
		return this.state();
	}

	schedule(delay = this.options?.debounceMs) {
		if (!this.active) return false;
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.timer = null;
			this.flush().catch(() => null);
		}, boundedDelay(delay));
		return true;
	}

	async flush() {
		if (!this.active || !this.options) {
			throw new MovieApiError(
				'MOVIE_AUTOSAVE_NOT_ACTIVE',
				'Movie autosave must be started before it can flush.'
			);
		}
		clearTimeout(this.timer);
		this.timer = null;
		try {
			const result = await saveMovieStudioPersistence(
				this.session,
				this.options
			);
			this.lastSavedRevision = this.session.revision;
			this.lastError = null;
			this.session.events.emit('autosave:saved', {
				key: this.options.key,
				revision: this.lastSavedRevision
			});
			return result;
		} catch (error) {
			this.lastError = {
				code: error?.code || 'MOVIE_AUTOSAVE_FAILED',
				message: error?.message || String(error)
			};
			this.session.events.emit('error', {
				...this.lastError,
				operation: 'autosave.flush',
				revision: this.session.revision
			});
			throw error;
		}
	}

	stop() {
		clearTimeout(this.timer);
		this.timer = null;
		for (const unsubscribe of this.unsubscribe) unsubscribe();
		this.unsubscribe = [];
		this.active = false;
		return this.state();
	}

	state() {
		return createMovieProjectSnapshot({
			active: this.active,
			lastError: this.lastError,
			lastSavedRevision: this.lastSavedRevision,
			options: this.options,
			pending: Boolean(this.timer)
		});
	}
}

function normalizeOptions(source) {
	return {
		adapterId: source.adapterId == null ? null : String(source.adapterId),
		debounceMs: boundedDelay(source.debounceMs ?? 750),
		key: String(source.key || 'autosave'),
		metadata: source.metadata || {},
		projectMetadata: source.projectMetadata || {},
		saveImmediately: Boolean(source.saveImmediately)
	};
}

function boundedDelay(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return 750;
	return Math.max(0, Math.min(60000, Math.round(number)));
}
