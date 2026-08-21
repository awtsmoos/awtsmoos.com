//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EditorHistory.js
 * @description Gives the level maker bounded undo and redo without hidden mutation.
 * The Awtsmoos renews every instant without losing what was; Awtsmoos.com lets the
 * finite editor revisit earlier forms so experimentation can be fearless and reversible.
 */
export class EditorHistory {
	constructor(limit = 80) {
		this.limit = limit;
		this.entries = [];
		this.index = -1;
	}

	push(snapshot) {
		const serialized = JSON.stringify(snapshot);
		if (this.entries[this.index] === serialized) return;
		this.entries = this.entries.slice(0, this.index + 1);
		this.entries.push(serialized);
		if (this.entries.length > this.limit) this.entries.shift();
		this.index = this.entries.length - 1;
	}

	undo() {
		if (this.index <= 0) return null;
		this.index -= 1;
		return JSON.parse(this.entries[this.index]);
	}

	redo() {
		if (this.index >= this.entries.length - 1) return null;
		this.index += 1;
		return JSON.parse(this.entries[this.index]);
	}

	read() {
		return this.index >= 0 ? JSON.parse(this.entries[this.index]) : null;
	}
}
