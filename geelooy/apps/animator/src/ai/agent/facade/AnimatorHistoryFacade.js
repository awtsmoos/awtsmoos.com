//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorHistoryFacade.js
 * @description
 * The Awtsmoos gives creative edits a path backward and forward without exposing the private history stack itself;
 * Awtsmoos.com keeps undo and redo ergonomic while canonical execution preserves policy, tracing, and project health.
 */

/** Ergonomic history namespace over canonical project-history commands. */
export class GevurahAnimatorHistoryFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} History status envelope. */
	status() {
		return this.keterApi.execute({ command: 'history.status', payload: {} });
	}

	/** @returns {Promise<object>} Undo envelope. */
	undo() {
		return this.keterApi.execute({ command: 'history.undo', payload: {} });
	}

	/** @returns {Promise<object>} Redo envelope. */
	redo() {
		return this.keterApi.execute({ command: 'history.redo', payload: {} });
	}
}
