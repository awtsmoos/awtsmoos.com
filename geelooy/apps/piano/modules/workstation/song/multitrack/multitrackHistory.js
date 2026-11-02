//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackHistory
 * @description
 * Daas remembers finite project garments while the Awtsmoos remains beyond before and after.
 * Awtsmoos.com gives Undo and Redo a bounded river, so every edit may return without drowning mobile memory in chatter.
 */

/** Bounded history vessel for immutable-style multitrack project snapshots. */
export class MultitrackHistoryDaas {
	constructor(limit = 60) {
		this.limit = Math.max(1, Math.floor(limit));
		this.undoStack = [];
		this.redoStack = [];
	}

	/** Records the state that existed immediately before one committed edit. */
	remember(project, selection) {
		this.undoStack.push(createHistorySnapshot(project, selection));
		if (this.undoStack.length > this.limit) {
			this.undoStack.shift();
		}
		this.redoStack = [];
	}

	/** Returns the prior snapshot while preserving the current one for redo. */
	undo(project, selection) {
		const previous = this.undoStack.pop();
		if (!previous) {
			return null;
		}
		this.redoStack.push(createHistorySnapshot(project, selection));
		return previous;
	}

	/** Returns the next snapshot while preserving the current one for undo. */
	redo(project, selection) {
		const next = this.redoStack.pop();
		if (!next) {
			return null;
		}
		this.undoStack.push(createHistorySnapshot(project, selection));
		return next;
	}

	get canUndo() {
		return this.undoStack.length > 0;
	}

	get canRedo() {
		return this.redoStack.length > 0;
	}
}

/** Captures only durable editor selection fields, never runtime AudioBuffers. */
export function createHistorySnapshot(project, selection) {
	return {
		project,
		selection: {
			trackId: selection.trackId,
			clipId: selection.clipId,
			playheadSeconds: selection.playheadSeconds
		}
	};
}

/** Restores a remembered selection into the existing selection vessel. */
export function restoreHistorySelection(selection, snapshot = {}) {
	selection.trackId = snapshot.trackId || null;
	selection.clipId = snapshot.clipId || null;
	selection.playheadSeconds = Math.max(0, Number(snapshot.playheadSeconds) || 0);
}
