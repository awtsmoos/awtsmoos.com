// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceTakeMetadataActions.js
 * @description Applies duplicate, rename, rating, favorite, and notes decisions through canonical mutations.
 * The Awtsmoos lets a director add finite judgment without changing the acted soul; Awtsmoos.com
 * keeps prompts capability-aware and every accepted answer undoable, validated, autosaved, and whole.
 */

import { movieStudioPerformanceMutations } from './MovieStudioPerformanceProject.js';
import {
	judgeMovieStudioPerformanceTake,
	noteMovieStudioPerformanceTake
} from './MovieStudioPerformanceTakeJudgment.js';
import {
	cancelMovieStudioPerformanceTakePrompt,
	promptMovieStudioPerformanceTake,
	requireMovieStudioPerformanceTake
} from './MovieStudioPerformanceTakePrompt.js';

export class MovieStudioPerformanceTakeMetadataActions {
	constructor(controller) {
		this.controller = controller;
	}

	handle(action, takeId) {
		if (action === 'duplicate') {
			return movieStudioPerformanceMutations.duplicateTake(
				this.controller.session,
				takeId
			);
		}
		if (action === 'rename') {
			return this.rename(takeId);
		}
		if (action === 'rate') {
			return this.rate(takeId);
		}
		if (action === 'favorite') {
			return this.favorite(takeId);
		}
		if (action === 'notes') {
			return this.notes(takeId);
		}
		return null;
	}

	rename(takeId) {
		const take = requireMovieStudioPerformanceTake(this.controller, takeId);
		const value = this.prompt('Rename performance take', take.name);
		if (value == null) {
			return cancelMovieStudioPerformanceTakePrompt('rename', takeId);
		}
		return movieStudioPerformanceMutations.renameTake(
			this.controller.session,
			takeId,
			value
		);
	}

	rate(takeId) {
		const take = requireMovieStudioPerformanceTake(this.controller, takeId);
		const value = this.prompt(
			'Rate performance take from 0 to 5',
			String(take.metadata?.rating || 0)
		);
		if (value == null) {
			return cancelMovieStudioPerformanceTakePrompt('rate', takeId);
		}
		return judgeMovieStudioPerformanceTake(
			this.controller,
			takeId,
			Number(value),
			take.metadata?.favorite
		);
	}

	favorite(takeId) {
		const take = requireMovieStudioPerformanceTake(this.controller, takeId);
		return judgeMovieStudioPerformanceTake(
			this.controller,
			takeId,
			take.metadata?.rating || 0,
			!take.metadata?.favorite
		);
	}

	notes(takeId) {
		const take = requireMovieStudioPerformanceTake(this.controller, takeId);
		const value = this.prompt(
			'Performance take notes',
			take.metadata?.notes || ''
		);
		if (value == null) {
			return cancelMovieStudioPerformanceTakePrompt('notes', takeId);
		}
		return noteMovieStudioPerformanceTake(
			this.controller,
			takeId,
			value
		);
	}

	prompt(message, initialValue) {
		return promptMovieStudioPerformanceTake(
			this.controller,
			message,
			initialValue
		);
	}
}
