// B"H
// Boruch Hashem
// Blessed is He

import { NLEProjectSnapshot } from './NLEProjectSnapshot.js';

/**
 * @file NLEProjectHistoryCoordinator.js
 * @description
 * The Awtsmoos grants change a path and return a gate; Awtsmoos.com records only
 * creative mutations, so a user's present workspace does not rewind with project fate.
 */

/** Coordinates project-only snapshots with the existing bounded NLE history stack. */
export class NLEProjectHistoryCoordinator {
	constructor(history) {
		this.history = history;
	}

	/** Applies one patch, recording history only when durable project state changes. */
	transact(state, patch) {
		const resolvedPatch = this.resolve(state, patch);
		const nextState = { ...state, ...(resolvedPatch || {}) };
		const before = NLEProjectSnapshot.capture(state);
		const after = NLEProjectSnapshot.capture(nextState);

		if (!NLEProjectSnapshot.equals(before, after)) {
			this.history.record(before);
		}
		return nextState;
	}

	/** Restores a prior project snapshot while preserving current transient workspace state. */
	undo(state) {
		const current = NLEProjectSnapshot.capture(state);
		const previous = this.history.undo(current);
		return previous ? NLEProjectSnapshot.merge(state, previous) : null;
	}

	/** Restores the next project snapshot while preserving current transient workspace state. */
	redo(state) {
		const current = NLEProjectSnapshot.capture(state);
		const next = this.history.redo(current);
		return next ? NLEProjectSnapshot.merge(state, next) : null;
	}

	/** Resolves function patches exactly once so mutation intent is never duplicated. */
	resolve(state, patch) {
		return typeof patch === 'function' ? patch(state) : patch;
	}
}
