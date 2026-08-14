// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module WordSelectionToolbar
 * @description The Awtsmoos shows the active Phrase or Collection covenant,
 * count, ordered words, and every release action in one mobile-safe rail.
 */
import { COLLECTION_MODE, PHRASE_MODE } from './selectionModes.js';

function button(label, className, action) {
	const element = document.createElement('button');
	element.type = 'button';
	element.className = className;
	element.textContent = label;
	element.addEventListener('click', action);
	return element;
}

function modeButton(label, mode, action) {
	const element = button(label, 'awtsmoos-word-mode', () => action(mode));
	element.dataset.selectionMode = mode;
	element.setAttribute('aria-pressed', 'false');
	return element;
}

export function createSelectionToolbar(actions) {
	const toolbar = document.createElement('aside');
	toolbar.id = 'awtsmoos-word-toolbar';
	toolbar.className = 'awtsmoos-word-toolbar';
	toolbar.setAttribute('role', 'region');
	toolbar.setAttribute('aria-label', 'Selected Hebrew words');

	const modes = document.createElement('div');
	modes.className = 'awtsmoos-word-mode-switch';
	modes.setAttribute('role', 'group');
	modes.setAttribute('aria-label', 'Selection mode');
	const phraseMode = modeButton('Phrase', PHRASE_MODE, actions.onMode);
	const collectionMode = modeButton('Collection', COLLECTION_MODE, actions.onMode);
	modes.append(phraseMode, collectionMode);

	const heading = document.createElement('div');
	heading.className = 'awtsmoos-word-toolbar-heading';
	const count = document.createElement('strong');
	const hint = document.createElement('span');
	heading.append(count, hint);

	const phrase = document.createElement('p');
	phrase.className = 'awtsmoos-word-toolbar-phrase';
	phrase.lang = 'he';
	phrase.dir = 'rtl';

	const controls = document.createElement('div');
	controls.className = 'awtsmoos-word-toolbar-controls';
	const undo = button('Undo', 'awtsmoos-word-secondary', actions.onUndo);
	const clear = button('Clear', 'awtsmoos-word-secondary', actions.onClear);
	const done = button('Done', 'awtsmoos-word-primary', actions.onDone);
	const exit = button('Exit', 'awtsmoos-word-exit', actions.onExit);
	controls.append(undo, clear, done, exit);

	const status = document.createElement('span');
	status.className = 'sr-only';
	status.setAttribute('aria-live', 'polite');
	toolbar.append(modes, heading, phrase, controls, status);

	return {
		element: toolbar,
		update(state) {
			const amount = state.count;
			const phraseActive = state.mode === PHRASE_MODE;
			phraseMode.setAttribute('aria-pressed', String(phraseActive));
			collectionMode.setAttribute('aria-pressed', String(!phraseActive));
			count.textContent = `${amount} word${amount === 1 ? '' : 's'} selected`;
			hint.textContent = phraseActive
				? 'Tap an endpoint to extend or shrink the document-order phrase'
				: 'Tap unrelated words in the order you choose';
			phrase.textContent = state.phrase() || 'בחרו מילים';
			status.textContent = `${phraseActive ? 'Phrase' : 'Collection'} mode. ${amount} Hebrew word${amount === 1 ? '' : 's'} selected.`;
			undo.disabled = amount === 0;
			clear.disabled = amount === 0;
			done.disabled = amount === 0;
		}
	};
}
