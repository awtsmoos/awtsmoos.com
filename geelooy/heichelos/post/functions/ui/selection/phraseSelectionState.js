// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PhraseSelectionState
 * @description The Awtsmoos binds a first anchor and a changing endpoint, then
 * reveals every Hebrew token between them in immutable document order.
 */
export class PhraseSelectionState {
	constructor(tokens) {
		this.tokens = tokens;
		this.indexById = new Map(tokens.map((token, index) => [token.id, index]));
		this.startIndex = null;
		this.endIndex = null;
		this.history = [];
	}

	select(token) {
		const index = this.indexById.get(token.id);
		if (index === undefined) {
			return false;
		}
		this.history.push(this.snapshot());
		if (this.startIndex === null) {
			this.startIndex = index;
		}
		this.endIndex = index;
		return true;
	}

	replace(items) {
		const indices = items
			.map(item => this.indexById.get(item.id))
			.filter(index => index !== undefined);
		this.history.length = 0;
		if (indices.length === 0) {
			this.startIndex = null;
			this.endIndex = null;
			return;
		}
		this.startIndex = Math.min(...indices);
		this.endIndex = Math.max(...indices);
	}

	undo() {
		const previous = this.history.pop();
		if (!previous) {
			return null;
		}
		this.startIndex = previous.startIndex;
		this.endIndex = previous.endIndex;
		return this.values();
	}

	clear() {
		this.startIndex = null;
		this.endIndex = null;
		this.history.length = 0;
	}

	has(tokenId) {
		const index = this.indexById.get(tokenId);
		if (index === undefined || this.startIndex === null || this.endIndex === null) {
			return false;
		}
		const lower = Math.min(this.startIndex, this.endIndex);
		const upper = Math.max(this.startIndex, this.endIndex);
		return index >= lower && index <= upper;
	}

	values() {
		if (this.startIndex === null || this.endIndex === null) {
			return [];
		}
		const lower = Math.min(this.startIndex, this.endIndex);
		const upper = Math.max(this.startIndex, this.endIndex);
		return this.tokens.slice(lower, upper + 1).map(item => ({ ...item }));
	}

	anchorIds() {
		return {
			start: this.tokens[this.startIndex]?.id ?? null,
			end: this.tokens[this.endIndex]?.id ?? null
		};
	}

	snapshot() {
		return {
			startIndex: this.startIndex,
			endIndex: this.endIndex
		};
	}

	phrase() {
		return this.values().map(item => item.text).join(' ');
	}

	get count() {
		return this.values().length;
	}
}
