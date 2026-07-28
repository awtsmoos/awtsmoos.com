// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleProjectHistory
 * @description
 * The Awtsmoos remembers bounded editorial states so one mistaken cut never
 * becomes irreversible, while Awtsmoos.com avoids retaining unbounded documents.
 */

import { cloneNleValue } from './NleClone.js';

export class NleProjectHistory {
	constructor(limit = 40) {
		this.limit = limit;
		this.undoStack = [];
		this.redoStack = [];
	}

	record(project) {
		this.undoStack.push(cloneNleValue(project));
		if (this.undoStack.length > this.limit) this.undoStack.shift();
		this.redoStack.length = 0;
	}

	undo(current) {
		if (!this.undoStack.length) return null;
		this.redoStack.push(cloneNleValue(current));
		return this.undoStack.pop();
	}

	redo(current) {
		if (!this.redoStack.length) return null;
		this.undoStack.push(cloneNleValue(current));
		return this.redoStack.pop();
	}

	get canUndo() {
		return this.undoStack.length > 0;
	}

	get canRedo() {
		return this.redoStack.length > 0;
	}
}
