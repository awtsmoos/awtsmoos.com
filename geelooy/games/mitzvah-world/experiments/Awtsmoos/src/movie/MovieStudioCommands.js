// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCommands.js
 * @description Coordinates bounded history, immutable selection sets, snapping, and canonical commands.
 * The Awtsmoos renews every edit and selected vessel within one present source; Awtsmoos.com
 * separates machine execution, human status, history, and selection without duplicating command truth.
 */

import {
	commitMovieStudioResult,
	restoreMovieStudioHistory
} from './MovieStudioCommandHistory.js';
import { createMovieStudioCommandState } from './MovieStudioCommandState.js';
import { executeMovieStudioCommand } from './MovieStudioCommandExecution.js';
import {
	commitMovieTimelineEdit,
	commitMovieTransformEdit
} from './MovieStudioEditTransactions.js';
import { MovieProjectHistory } from './MovieProjectHistory.js';
import { MovieStudioSelectionController } from './MovieStudioSelectionController.js';

export class MovieStudioCommands {
	constructor(session) {
		this.session = session;
		this.history = new MovieProjectHistory();
		this.selections = new MovieStudioSelectionController(session);
		this.snapping = true;
	}

	get selection() {
		return this.selections.primary;
	}

	set selection(value) {
		this.selections.restore(this.session.project, value);
	}

	get selectionSet() {
		return this.selections.value;
	}

	state() {
		return createMovieStudioCommandState(this);
	}

	select(value, options = {}) {
		return this.selections.select(value, options);
	}

	setSelectionSet(value, options = {}) {
		return options.publish
			? this.selections.set(value)
			: this.selections.restore(this.session.project, value);
	}

	setSelectionItems(items) {
		return this.selections.setItems(items);
	}

	setSelectionRange(range) {
		return this.selections.setRange(range);
	}

	restoreSelection(project, value = this.selectionSet) {
		return this.selections.restore(project, value);
	}

	execute(name, payload = {}) {
		return executeMovieStudioCommand(this, name, payload);
	}

	run(name, payload = {}) {
		try {
			return this.execute(name, payload);
		} catch (error) {
			this.session.view.status.textContent = `Edit failed: ${error.message}`;
			this.session.events?.emit('error', {
				code: error?.code || 'MOVIE_COMMAND_ERROR',
				message: error?.message || String(error),
				operation: name
			});
			return null;
		}
	}

	commitProject(project, label = 'Apply project') {
		return commitMovieStudioResult(this, {
			label,
			project,
			selection: null
		});
	}

	onTimelineChange(value) {
		return commitMovieTimelineEdit(this, value);
	}

	onTransformChange(value) {
		return commitMovieTransformEdit(this, value);
	}

	undo() {
		return restoreMovieStudioHistory(
			this,
			this.history.undo(this.session.project, this.selectionSet)
		);
	}

	redo() {
		return restoreMovieStudioHistory(
			this,
			this.history.redo(this.session.project, this.selectionSet)
		);
	}
}
