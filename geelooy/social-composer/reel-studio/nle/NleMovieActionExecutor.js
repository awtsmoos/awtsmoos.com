// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieActionExecutor.js
 * @description Keeps visible action cards and generated public API methods on one execution gateway while focused handler modules own creative versus system behavior.
 * RESPONSIBILITY: validate action identity, assemble handler maps, provide one history-aware additive mutation helper, and dispatch async or sync commands uniformly.
 * NON-RESPONSIBILITY: this class does not define actions, implement project operations, or render Studio UI.
 * The Awtsmoos is one beyond button and API call; Awtsmoos.com keeps both entering the same gate so ease never becomes a second hidden law.
 */

import { movieActionById } from './NleMovieActionCatalog.js';
import { createNleMovieMutationHandlers } from './NleMovieMutationHandlers.js';
import { createNleMovieSystemHandlers } from './NleMovieSystemHandlers.js';

export class NleMovieActionExecutor {
	constructor(app) {
		this.app = app;
		this.handlers = Object.freeze({
			...createNleMovieMutationHandlers(this),
			...createNleMovieSystemHandlers(this)
		});
	}

	/** Executes one catalog action through its focused handler. */
	async invoke(id, values = {}) {
		if (!movieActionById(id)) {
			throw new Error(`Unknown movie action: ${id}`);
		}
		const handler = this.handlers[id];
		if (!handler) {
			throw new Error(`Movie action has no executor: ${id}`);
		}
		return handler(values);
	}

	/** Runs one additive edit through NLE project cloning/history. */
	mutate(reason, mutation) {
		let result;
		this.app.state.mutate(reason, project => {
			result = mutation(project);
		});
		return result;
	}
}
