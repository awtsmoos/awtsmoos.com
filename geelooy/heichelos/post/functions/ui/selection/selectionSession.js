// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module WordSelectionSession
 * @description One Awtsmoos session owns temporary tokens and one canonical
 * Phrase-or-Collection state while scrolling, completion, and restoration agree.
 */
import { makeToast } from '../../ui.js';
import { showSelectionPanel } from './selectionPanel.js';
import { SelectionModeState } from './selectionModeState.js';
import { SelectionTokenInput } from './selectionTokenInput.js';
import { createSelectionToolbar } from './selectionToolbar.js';
import { tokenizeReader } from './tokenizeReader.js';

function renderToken(token, state, anchors) {
	const selected = state.has(token.id);
	token.element.classList.toggle('is-selected', selected);
	token.element.classList.toggle('is-range-start', token.id === anchors.start);
	token.element.classList.toggle('is-range-end', token.id === anchors.end);
	token.element.setAttribute('aria-pressed', String(selected));
}

export class WordSelectionSession {
	constructor(root, seedToken, onClosed) {
		this.root = root;
		this.seedToken = seedToken;
		this.onClosed = onClosed;
		this.tokenized = tokenizeReader(root, seedToken?.range ?? null);
		this.tokens = this.tokenized.tokens;
		this.state = new SelectionModeState(this.tokens);
		this.handleKeydown = event => this.onKeydown(event);
		this.toolbar = createSelectionToolbar({
			onMode: mode => this.setMode(mode),
			onUndo: () => this.undo(),
			onClear: () => this.clear(),
			onDone: () => this.finish(),
			onExit: () => this.exit()
		});
	}

	connect() {
		if (this.tokens.length === 0) {
			makeToast('No Hebrew words were found in this reader.');
			return false;
		}
		new SelectionTokenInput(token => this.select(token)).connect(this.tokens);
		this.root.dataset.awtsmoosWordSelection = 'true';
		document.body.classList.add('awtsmoos-word-selection-active');
		document.body.append(this.toolbar.element);
		document.addEventListener('keydown', this.handleKeydown);
		const seed = this.resolveSeed();
		this.select(seed);
		seed.element.scrollIntoView({ block: 'center', behavior: 'smooth' });
		seed.element.focus({ preventScroll: true });
		return true;
	}

	resolveSeed() {
		return this.tokenized.seedToken
			?? this.tokens.find(token => token.text === this.seedToken?.text)
			?? this.tokens[0];
	}

	select(token) {
		this.state.select(token);
		this.render();
	}

	setMode(mode) {
		if (this.state.setMode(mode)) {
			this.render();
		}
	}

	render() {
		const anchors = this.state.anchorIds();
		this.tokens.forEach(token => renderToken(token, this.state, anchors));
		this.root.dataset.awtsmoosSelectionMode = this.state.mode;
		this.toolbar.update(this.state);
	}

	undo() {
		this.state.undo();
		this.render();
	}

	clear() {
		this.state.clear();
		this.render();
	}

	finish() {
		if (this.state.count === 0) {
			makeToast('Choose at least one Hebrew word.');
			return;
		}
		const items = this.state.values();
		this.exit();
		showSelectionPanel(items);
	}

	onKeydown(event) {
		if (event.key === 'Escape') {
			event.preventDefault();
			this.exit();
		}
	}

	exit() {
		document.removeEventListener('keydown', this.handleKeydown);
		this.toolbar.element.remove();
		delete this.root.dataset.awtsmoosWordSelection;
		delete this.root.dataset.awtsmoosSelectionMode;
		document.body.classList.remove('awtsmoos-word-selection-active');
		this.tokenized.restore();
		this.onClosed(this);
	}
}
