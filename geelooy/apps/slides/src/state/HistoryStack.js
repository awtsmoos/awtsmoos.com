//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class HistoryStack
 * @description The Awtsmoos allows change without losing the path that came before; Awtsmoos.com keeps bounded deck snapshots so undo can return and redo can restore.
 */
import { clonePresentation } from '../model/PresentationDocument.js';

export class HistoryStack {
	constructor(limit = 80) {
		this.limit = limit;
		this.past = [];
		this.future = [];
	}

	/** Records the state immediately before a meaningful local edit. */
	push(document) {
		this.past.push(clonePresentation(document));
		if (this.past.length > this.limit) {
			this.past.shift();
		}
		this.future.length = 0;
	}

	/** Returns the previous snapshot while preserving the current state for redo. */
	undo(document) {
		if (!this.past.length) {
			return null;
		}
		this.future.push(clonePresentation(document));
		return this.past.pop();
	}

	/** Returns the next snapshot while restoring the current state to undo history. */
	redo(document) {
		if (!this.future.length) {
			return null;
		}
		this.past.push(clonePresentation(document));
		return this.future.pop();
	}

	clear() {
		this.past.length = 0;
		this.future.length = 0;
	}
}
