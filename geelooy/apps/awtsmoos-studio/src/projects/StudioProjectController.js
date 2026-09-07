//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProjectController.js
 * @description Joins shared reversible movie history with Studio-local canonical project persistence and recovery.
 * The Awtsmoos renews one movie through change, memory, and return while Awtsmoos.com keeps each duty in its proper vessel;
 * history remembers revisions, storage remembers projects, and the controller binds them without inventing another cinematic level.
 */

import { StudioMovieHistory } from './StudioMovieHistory.js';
import { StudioProjectStorage } from './StudioProjectStorage.js';

export class StudioProjectController {
	constructor(movie, options = {}) {
		this.history = new StudioMovieHistory(movie);
		this.storage = new StudioProjectStorage(options.storage);
	}

	record(movie, label = 'Studio movie edit') {
		const recorded = this.history.record(movie, label);
		this.storage.saveRecovery(recorded);
		return recorded;
	}

	reset(movie, options = {}) {
		const reset = this.history.reset(movie);
		if (options.recover !== false) {
			this.storage.saveRecovery(reset);
		}
		return reset;
	}

	undo() {
		const movie = this.history.undo();
		this.storage.saveRecovery(movie);
		return movie;
	}

	redo() {
		const movie = this.history.redo();
		this.storage.saveRecovery(movie);
		return movie;
	}

	canUndo() {
		return this.history.canUndo();
	}

	canRedo() {
		return this.history.canRedo();
	}

	save(movie, options = {}) {
		return this.storage.save(movie, options);
	}

	load(id) {
		return this.storage.load(id);
	}

	recover() {
		return this.storage.loadRecovery();
	}

	list() {
		return this.storage.list();
	}

	hasRecovery() {
		return this.storage.hasRecovery();
	}
}
