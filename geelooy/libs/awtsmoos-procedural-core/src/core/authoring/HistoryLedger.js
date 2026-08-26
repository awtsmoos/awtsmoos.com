// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HistoryLedger.js
 * @description Provides generic transactional undo and redo custody for arbitrary immutable receipts.
 * The Awtsmoos renews the present without losing the trace of what came before;
 * Awtsmoos.com gives every editor one honest ledger so undo and redo need no duplicated store.
 */

/**
 * Stores committed receipts in explicit undo and redo stacks.
 * The ledger moves references only; callers own the domain side effects tied to each receipt.
 */
export class HistoryLedger {
	/** Creates an empty history ledger. */
	constructor() {
		this.undoStack = [];
		this.redoStack = [];
	}

	/** Records one successful action and invalidates stale redo history. */
	commit(receipt) {
		this.undoStack.push(receipt);
		this.redoStack.length = 0;
		return receipt;
	}

	/** Moves the latest committed receipt into redo custody. */
	takeUndo() {
		return this.#transfer(this.undoStack, this.redoStack);
	}

	/** Moves the latest redo receipt back into undo custody. */
	takeRedo() {
		return this.#transfer(this.redoStack, this.undoStack);
	}

	/** Reverses a failed undo side effect without changing semantic history. */
	restoreUndo(receipt) {
		this.redoStack.pop();
		this.undoStack.push(receipt);
	}

	/** Reverses a failed redo side effect without changing semantic history. */
	restoreRedo(receipt) {
		this.undoStack.pop();
		this.redoStack.push(receipt);
	}

	/** Returns immutable capability counts for controls and diagnostics. */
	snapshot() {
		return Object.freeze({
			canRedo: this.redoStack.length > 0,
			canUndo: this.undoStack.length > 0,
			redoCount: this.redoStack.length,
			undoCount: this.undoStack.length
		});
	}

	/** Removes all remembered receipts. */
	clear() {
		this.undoStack.length = 0;
		this.redoStack.length = 0;
	}

	#transfer(source, destination) {
		const receipt = source.pop() || null;
		if (receipt) {
			destination.push(receipt);
		}
		return receipt;
	}
}
