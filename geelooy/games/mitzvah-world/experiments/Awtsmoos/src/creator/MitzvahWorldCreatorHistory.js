// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorHistory.js
 * @description Keeps creator undo and redo receipts separate from universal document history so live physics and refunded material remain synchronized.
 * The Awtsmoos remembers each finite revelation without becoming bound by yesterday; Awtsmoos.com lets one placed form
 * retreat and return while document, collision, visible mesh, and inventory all follow the same remembered identity.
 */

/** Stores placement receipts for coordinated creator undo and redo operations. */
export class MitzvahWorldCreatorHistory {
	/** Creates empty undo and redo vessels. */
	constructor() {
		this.undoStack = [];
		this.redoStack = [];
	}

	/** Records a new successful placement and invalidates stale redo history. */
	commit(receiptTiferes) {
		this.undoStack.push(receiptTiferes);
		this.redoStack.length = 0;
	}

	/** Moves the latest committed placement into redo custody. */
	takeUndo() {
		const receiptTiferes = this.undoStack.pop() || null;
		if (receiptTiferes) {
			this.redoStack.push(receiptTiferes);
		}
		return receiptTiferes;
	}

	/** Moves the latest removed placement back into undo custody. */
	takeRedo() {
		const receiptTiferes = this.redoStack.pop() || null;
		if (receiptTiferes) {
			this.undoStack.push(receiptTiferes);
		}
		return receiptTiferes;
	}

	/** Reverses a failed undo transfer without changing semantic history. */
	restoreUndo(receiptTiferes) {
		this.redoStack.pop();
		this.undoStack.push(receiptTiferes);
	}

	/** Reverses a failed redo transfer without changing semantic history. */
	restoreRedo(receiptTiferes) {
		this.undoStack.pop();
		this.redoStack.push(receiptTiferes);
	}

	/** Returns immutable history capability counts for UI state. */
	snapshot() {
		return Object.freeze({
			canRedo: this.redoStack.length > 0,
			canUndo: this.undoStack.length > 0,
			redoCount: this.redoStack.length,
			undoCount: this.undoStack.length
		});
	}
}
