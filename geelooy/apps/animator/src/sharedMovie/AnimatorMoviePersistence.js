//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorMoviePersistence.js
 * @description The dock movie used to vanish on every reload; the Awtsmoos now lets
 * Awtsmoos.com keep the canonical document in versioned local storage, restore it on
 * boot, and warn before an unload would discard an unsaved change. Storage failures
 * (quota, privacy mode) never break movie loading — they only keep the dirty flag up.
 */
import { binahMigrateMovie, validateMovie } from '../../../shared/movie/index.js';

export const AWTSMOOS_ANIMATOR_MOVIE_STORAGE_KEY = 'awtsmoos.animator.movie.v1';

export class AnimatorMoviePersistence {
	constructor(storageKey = AWTSMOOS_ANIMATOR_MOVIE_STORAGE_KEY) {
		this.storageKey = storageKey;
		this.savedJson = this.readRaw();
		this.pendingJson = null;
		this.dirty = false;
		this.saveError = null;
		this.saveTimer = null;
		this.installed = false;
	}

	/** @returns {string|null} Raw stored document, or null when storage is empty/unreadable. */
	readRaw() {
		try {
			return globalThis.localStorage?.getItem(this.storageKey) ?? null;
		} catch {
			return null;
		}
	}

	/**
	 * Read the stored document for boot restore. The document is migrated and
	 * validated exactly the way the dock state will treat it; anything that
	 * fails is ignored (with a console note) rather than breaking the boot.
	 * @returns {object|null} Stored canonical movie, or null.
	 */
	readStoredMovie() {
		const raw = this.readRaw();
		if (!raw) {
			return null;
		}
		try {
			const migrated = binahMigrateMovie(JSON.parse(raw));
			const report = validateMovie(migrated);
			if (report.valid) {
				return migrated;
			}
			console.warn('B"H - Animator: stored dock movie failed validation and was ignored.', report.errors);
		} catch (error) {
			console.warn('B"H - Animator: stored dock movie is unreadable and was ignored.', error);
		}
		return null;
	}

	/**
	 * Subscribe to the dock state: every published movie is debounce-saved,
	 * and an unload with a pending or failed save asks the browser to warn.
	 * @param {object} state MalchusMovieDataState instance from the mounted dock.
	 */
	install(state) {
		if (this.installed || typeof state?.subscribe !== 'function') {
			return;
		}
		this.installed = true;
		state.subscribe(snapshot => this.onSnapshot(snapshot));
		globalThis.addEventListener?.('beforeunload', event => {
			this.flush();
			if (this.dirty) {
				event.preventDefault();
				event.returnValue = '';
			}
		});
		globalThis.addEventListener?.('pagehide', () => this.flush());
	}

	onSnapshot(snapshot) {
		if (!snapshot?.movie) {
			return;
		}
		const json = JSON.stringify(snapshot.movie);
		if (json === this.savedJson) {
			this.pendingJson = null;
			this.dirty = false;
			return;
		}
		this.pendingJson = json;
		this.dirty = true;
		clearTimeout(this.saveTimer);
		this.saveTimer = setTimeout(() => this.flush(), 300);
	}

	/** @returns {boolean} True when storage now holds the latest movie (or there is nothing to save). */
	flush() {
		if (!this.dirty || this.pendingJson == null) {
			return true;
		}
		try {
			if (!globalThis.localStorage) {
				return false;
			}
			globalThis.localStorage.setItem(this.storageKey, this.pendingJson);
			this.savedJson = this.pendingJson;
			this.pendingJson = null;
			this.dirty = false;
			this.saveError = null;
			return true;
		} catch (error) {
			this.saveError = error;
			console.warn('B"H - Animator: the dock movie could not be saved to local storage.', error);
			return false;
		}
	}
}
