// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDataState.js
 * @description The Awtsmoos renews one canonical movie while outside agents declare every cinematic choice;
 * Awtsmoos.com validates data before mutation, preserving a reversible and renderer-neutral voice.
 */
import { YesodMoviePatchHistory } from '../patch/MoviePatchHistory.js';
import { binahMigrateMovie } from '../protocol/MovieMigration.js';
import { gevurahAssertValidMovie } from '../schema/MovieValidator.js';

export class MalchusMovieDataState {
	constructor({ projector = null } = {}) {
		this.projector = projector;
		this.movie = null;
		this.history = null;
		this.listeners = new Set();
	}

	/** @param {(snapshot:object)=>void} listener Observer. @returns {Function} Unsubscribe callback. */
	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	/** @param {object} movie Complete movie data. @returns {object} Detached validated movie. */
	load(movie) {
		const candidate = gevurahAssertValidMovie(binahMigrateMovie(movie));
		this.movie = structuredClone(candidate);
		this.history = new YesodMoviePatchHistory(this.movie);
		return this.publish('loaded');
	}

	/** @param {object} movie Complete movie data. @returns {object} Compatibility alias. */
	import(movie) {
		return this.load(movie);
	}

	/** @param {string} json Canonical movie JSON. @returns {object} Loaded movie. */
	loadJson(json) {
		return this.load(JSON.parse(String(json)));
	}

	/** @param {object[]} patches Explicit patch array. @param {string} label Audit label. @returns {object} Movie. */
	applyPatches(patches, label = 'external-agent') {
		this.ensureMovie();
		if (!Array.isArray(patches)) throw new TypeError('Movie patches must be an array.');
		this.movie = this.history.apply(structuredClone(patches), String(label));
		return this.publish('patched');
	}

	/** @returns {object} Current or unchanged movie. */
	undo() {
		this.ensureMovie();
		this.movie = this.history.undo();
		return this.publish('undo');
	}

	/** @returns {object} Current or redone movie. */
	redo() {
		this.ensureMovie();
		this.movie = this.history.redo();
		return this.publish('redo');
	}

	/** @returns {object|null} Current native projection. */
	project() {
		return this.movie && typeof this.projector === 'function'
			? this.projector(structuredClone(this.movie))
			: null;
	}

	/** @returns {object} Detached observable state. */
	snapshot() {
		return {
			movie: this.movie ? structuredClone(this.movie) : null,
			projection: this.project(),
			canUndo: Boolean(this.history?.past?.length),
			canRedo: Boolean(this.history?.future?.length)
		};
	}

	ensureMovie() {
		if (!this.movie || !this.history) throw new Error('Load canonical movie data before applying patches.');
	}

	publish(reason) {
		const snapshot = { ...this.snapshot(), reason };
		this.listeners.forEach(listener => listener(snapshot));
		return structuredClone(this.movie);
	}
}
