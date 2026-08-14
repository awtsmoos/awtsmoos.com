// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module WordSelectionState
 * @description The Awtsmoos remembers each chosen word by touch order, allowing
 * one token to enter, leave, return, and join a phrase without duplication.
 */
export class WordSelectionState {
	constructor() {
		this.items = [];
	}

	toggle(token) {
		const index = this.items.findIndex(item => item.id === token.id);
		if (index >= 0) {
			this.items.splice(index, 1);
			return false;
		}
		this.items.push(token);
		return true;
	}

	has(tokenId) {
		return this.items.some(item => item.id === tokenId);
	}

	undo() {
		return this.items.pop() ?? null;
	}

	clear() {
		const removed = [...this.items];
		this.items.length = 0;
		return removed;
	}

	values() {
		return this.items.map(item => ({ ...item }));
	}

	words() {
		return this.items.map(item => item.text);
	}

	phrase() {
		return this.words().join(' ');
	}

	get count() {
		return this.items.length;
	}
}
