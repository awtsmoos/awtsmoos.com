// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { cloneJson } from "./data.js";

/** Snapshot history preserving exact undo and redo across universal commands. */
export class History {
	#undo = [];
	#redo = [];

	push(entry) {
		this.#undo.push(cloneJson(entry));
		this.#redo.length = 0;
	}

	undo(current) {
		const entry = this.#undo.pop();
		if (!entry) return null;
		this.#redo.push({ ...entry, before: cloneJson(current), after: entry.after });
		return cloneJson(entry.before);
	}

	redo(current) {
		const entry = this.#redo.pop();
		if (!entry) return null;
		this.#undo.push({ ...entry, before: cloneJson(current), after: entry.after });
		return cloneJson(entry.after);
	}

	get canUndo() {
		return this.#undo.length > 0;
	}

	get canRedo() {
		return this.#redo.length > 0;
	}

	summary() {
		return { undoCount: this.#undo.length, redoCount: this.#redo.length };
	}
}
