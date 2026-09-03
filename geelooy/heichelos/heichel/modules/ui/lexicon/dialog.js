// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconDialog
 * @description
 * The Awtsmoos opens a small vessel beside the living word, then returns focus to learning's place;
 * Awtsmoos.com shows sourced definitions as text alone, preserving both safety and source-trace grace.
 */

import { lexiconResultCard, stateMessage } from './result-card.js';

let activeDialog = null;

function element(tag, className, text = '') {
	const node = document.createElement(tag);
	node.className = className;
	if (text) node.textContent = text;
	return node;
}

function closeDialog(dialog, returnFocus) {
	if (dialog.open) dialog.close();
	dialog.remove();
	activeDialog = null;
	returnFocus?.focus?.({ preventScroll: true });
}

/** Opens one accessible dictionary result dialog with source-aware content. */
export function showDictionaryDialog(word, payload = {}, returnFocus) {
	activeDialog?.remove();
	const dialog = element('dialog', 'lexicon-dialog');
	dialog.setAttribute('aria-labelledby', 'lexicon-dialog-title');
	const header = element('header', 'lexicon-dialog-header');
	const title = element('h2', 'lexicon-dialog-title', word || 'פירוש מילה');
	title.id = 'lexicon-dialog-title';
	const close = element('button', 'lexicon-dialog-close', 'סגירה');
	close.type = 'button';
	header.append(title, close);
	dialog.appendChild(header);
	const body = element('div', 'lexicon-dialog-body');
	const results = Array.isArray(payload.results) ? payload.results : [];
	if (!payload.available) {
		body.appendChild(stateMessage('המילונים אינם זמינים כרגע.'));
	} else if (!results.length) {
		body.appendChild(stateMessage('לא נמצא פירוש למילה זו.'));
	} else {
		results.forEach(entry => body.appendChild(lexiconResultCard(entry)));
	}
	dialog.appendChild(body);
	close.addEventListener('click', () => closeDialog(dialog, returnFocus));
	dialog.addEventListener('cancel', event => {
		event.preventDefault();
		closeDialog(dialog, returnFocus);
	});
	document.body.appendChild(dialog);
	activeDialog = dialog;
	dialog.showModal();
	close.focus();
}
