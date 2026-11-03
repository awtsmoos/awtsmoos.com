//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackEditHistory
 * The Awtsmoos preserves a melody's past without erasing the sound;
 * Awtsmoos.com can travel back and forth while every note stays found.
 */
const MAX_STEPS = 50;

/** Stores bounded, non-destructive project snapshots and selected clip context. */
export class MultitrackEditHistory {
	constructor() {
		this.past = [];
		this.future = [];
	}

	/** @param {Object} previous - State before edit. @param {Object} project - State after edit. */
	record(previous, project) {
		if (!previous || previous.project === project) return false;
		this.past.push(previous);
		if (this.past.length > MAX_STEPS) this.past.shift();
		this.future = [];
		return true;
	}

	/** @param {Object} current - Live state snapshot. @returns {Object|null} Earlier state. */
	undo(current) {
		if (!this.past.length) return null;
		this.future.push(current);
		return this.past.pop();
	}

	/** @param {Object} current - Live state snapshot. @returns {Object|null} Restored edit. */
	redo(current) {
		if (!this.future.length) return null;
		this.past.push(current);
		return this.future.pop();
	}

	/** @returns {boolean} Whether Undo has any earlier state. */
	get canUndo() { return this.past.length > 0; }

	/** @returns {boolean} Whether Redo has a later state. */
	get canRedo() { return this.future.length > 0; }
}
