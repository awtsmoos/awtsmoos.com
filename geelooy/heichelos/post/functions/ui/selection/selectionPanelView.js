// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SelectedWordsPanelView
 * @description The Awtsmoos shapes Hebrew, phonetics, honest search variants,
 * individual words, and research deeds into one clear focus-safe dialog.
 */
import { createSelectionVariantList } from './selectionVariantList.js';

function actionButton(action, activate) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'awtsmoos-selection-action';
	button.innerHTML = `<span aria-hidden="true">${action.icon}</span><strong></strong>`;
	button.lastElementChild.textContent = action.label;
	button.addEventListener('click', () => activate(action.action));
	return button;
}

function wordButton(wordAction, activate) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'awtsmoos-selection-word-chip';
	button.lang = 'he';
	button.dir = 'rtl';
	button.textContent = wordAction.label;
	button.addEventListener('click', () => activate(wordAction.action));
	return button;
}

function phoneticCard(model) {
	const card = document.createElement('p');
	card.className = 'awtsmoos-selection-phonetics';
	const heading = document.createElement('strong');
	heading.textContent = 'Phonetic reading';
	const reading = document.createElement('span');
	reading.textContent = model.phonetics.text;
	const note = document.createElement('small');
	note.textContent = model.phonetics.approximate
		? 'Approximate where nekudos are missing.'
		: 'Calculated from the visible letters and nekudos.';
	card.append(heading, reading, note);
	return card;
}

function heading(text) {
	const element = document.createElement('h3');
	element.textContent = text;
	return element;
}

export function createSelectionPanelView(model, handlers) {
	const backdrop = document.createElement('div');
	backdrop.id = 'awtsmoos-selection-panel';
	backdrop.className = 'awtsmoos-selection-backdrop';
	const dialog = document.createElement('section');
	dialog.className = 'awtsmoos-selection-panel';
	dialog.setAttribute('role', 'dialog');
	dialog.setAttribute('aria-modal', 'true');
	dialog.setAttribute('aria-labelledby', 'awtsmoos-selection-title');

	const header = document.createElement('header');
	const title = document.createElement('h2');
	title.id = 'awtsmoos-selection-title';
	title.textContent = 'Selected Hebrew';
	const close = document.createElement('button');
	close.type = 'button';
	close.className = 'awtsmoos-selection-close';
	close.setAttribute('aria-label', 'Close selected Hebrew');
	close.textContent = '×';
	close.addEventListener('click', handlers.onClose);
	header.append(title, close);

	const phrase = document.createElement('p');
	phrase.className = 'awtsmoos-selection-phrase';
	phrase.lang = 'he';
	phrase.dir = 'rtl';
	phrase.textContent = model.phrase;

	const variants = createSelectionVariantList(model.searchVariants, handlers.onActivate);
	const words = document.createElement('div');
	words.className = 'awtsmoos-selection-word-list';
	words.append(...model.wordActions.map(action => wordButton(action, handlers.onActivate)));
	const actions = document.createElement('div');
	actions.className = 'awtsmoos-selection-actions';
	actions.append(...model.actions.map(action => actionButton(action, handlers.onActivate)));

	dialog.append(
		header,
		phrase,
		phoneticCard(model),
		heading('Search phrase variants'),
		variants,
		heading('Search individual words'),
		words,
		actions
	);
	backdrop.append(dialog);
	backdrop.addEventListener('click', event => {
		if (event.target === backdrop) {
			handlers.onClose();
		}
	});
	return { backdrop, close, dialog };
}
