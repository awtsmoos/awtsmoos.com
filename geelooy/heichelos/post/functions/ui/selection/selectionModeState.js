// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SelectionModeState
 * @description One Awtsmoos state source lets Phrase reveal document order and
 * Collection retain chosen order without parallel unsynchronized truth.
 */
import { PhraseSelectionState } from './phraseSelectionState.js';
import { WordSelectionState } from './selectionState.js';
import {
	COLLECTION_MODE,
	PHRASE_MODE,
	isSelectionMode
} from './selectionModes.js';

export class SelectionModeState {
	constructor(tokens) {
		this.mode = PHRASE_MODE;
		this.phraseState = new PhraseSelectionState(tokens);
		this.collectionState = new WordSelectionState();
	}

	select(token) {
		if (this.mode === PHRASE_MODE) {
			this.phraseState.select(token);
			return true;
		}
		return this.collectionState.toggle(token);
	}

	setMode(mode) {
		if (!isSelectionMode(mode) || mode === this.mode) {
			return false;
		}
		const visibleItems = this.values();
		if (mode === PHRASE_MODE) {
			this.phraseState.replace(visibleItems);
			this.collectionState.clear();
		} else {
			this.collectionState.clear();
			visibleItems.forEach(item => this.collectionState.toggle(item));
			this.phraseState.clear();
		}
		this.mode = mode;
		return true;
	}

	undo() {
		return this.mode === PHRASE_MODE
			? this.phraseState.undo()
			: this.collectionState.undo();
	}

	clear() {
		this.phraseState.clear();
		this.collectionState.clear();
	}

	has(tokenId) {
		return this.mode === PHRASE_MODE
			? this.phraseState.has(tokenId)
			: this.collectionState.has(tokenId);
	}

	values() {
		return this.mode === PHRASE_MODE
			? this.phraseState.values()
			: this.collectionState.values();
	}

	anchorIds() {
		return this.mode === PHRASE_MODE
			? this.phraseState.anchorIds()
			: { start: null, end: null };
	}

	phrase() {
		return this.values().map(item => item.text).join(' ');
	}

	get count() {
		return this.values().length;
	}

	get isCollection() {
		return this.mode === COLLECTION_MODE;
	}
}
