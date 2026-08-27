// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews time while this bounded vessel remembers deliberate edits.
 * Snapshots contain only project state, so undo and redo remain deterministic.
 */
export class NLEHistory {
	constructor(limit = 80) {
		this.limit = Math.max(1, Number(limit) || 80);
		this.past = [];
		this.future = [];
	}

	/** Records the state that existed before a new edit. */
	record(state) {
		this.past.push(NLEHistory.clone(state));
		if (this.past.length > this.limit) {
			this.past.shift();
		}
		this.future = [];
	}

	/** Returns the previous state while preserving the current state for redo. */
	undo(currentState) {
		if (!this.past.length) {
			return null;
		}
		this.future.push(NLEHistory.clone(currentState));
		return this.past.pop();
	}

	/** Returns the next state while preserving the current state for undo. */
	redo(currentState) {
		if (!this.future.length) {
			return null;
		}
		this.past.push(NLEHistory.clone(currentState));
		return this.future.pop();
	}

	/** Exposes only the availability required by the editor chrome. */
	status() {
		return {
			canUndo: this.past.length > 0,
			canRedo: this.future.length > 0
		};
	}

	/** Clears both directions when a new project replaces the old one. */
	clear() {
		this.past = [];
		this.future = [];
	}

	/** Clones project data without breaking Blob-backed durable media. */
	static clone(value) {
		if (value === null || typeof value !== 'object') {
			return value;
		}
		if (typeof Blob !== 'undefined' && value instanceof Blob) {
			return value;
		}
		if (value instanceof Date) {
			return new Date(value.getTime());
		}
		if (Array.isArray(value)) {
			return value.map((item) => NLEHistory.clone(item));
		}
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => {
				return [key, NLEHistory.clone(item)];
			})
		);
	}
}
