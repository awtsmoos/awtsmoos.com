// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectHistory.js
 * @description Stores bounded canonical project and selection snapshots for reversible editing.
 * The Awtsmoos creates every apparent past and future within the present instant;
 * Awtsmoos.com keeps finite documents and identities independent, bounded, and truthfully labeled.
 */

export class MovieProjectHistory {
	constructor(limit = 64) {
		this.limit = Math.max(1, Number(limit) || 64);
		this.past = [];
		this.future = [];
	}

	get canUndo() {
		return this.past.length > 0;
	}

	get canRedo() {
		return this.future.length > 0;
	}

	commit(previousProject, label = 'Edit project', previousSelection = null) {
		this.past.push(entry(previousProject, label, previousSelection));
		if (this.past.length > this.limit) this.past.shift();
		this.future = [];
	}

	undo(currentProject, currentSelection = null) {
		if (!this.canUndo) return null;
		const previous = this.past.pop();
		this.future.push(entry(
			currentProject,
			previous.label,
			currentSelection
		));
		return restoreEntry(previous, `Undo ${previous.label}`);
	}

	redo(currentProject, currentSelection = null) {
		if (!this.canRedo) return null;
		const next = this.future.pop();
		this.past.push(entry(
			currentProject,
			next.label,
			currentSelection
		));
		return restoreEntry(next, `Redo ${next.label}`);
	}

	clear() {
		this.past = [];
		this.future = [];
	}
}

function entry(project, label, selection) {
	return {
		label: String(label),
		project: clone(project),
		selection: clone(selection)
	};
}

function restoreEntry(value, label) {
	return {
		label,
		project: clone(value.project),
		selection: clone(value.selection)
	};
}

function clone(value) {
	if (value == null) return value;
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}
