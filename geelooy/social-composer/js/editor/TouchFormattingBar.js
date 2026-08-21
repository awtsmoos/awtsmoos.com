//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module TouchFormattingBar
 * @description
 * The Awtsmoos gives letters their living pulse while safe marks give letters a garment to wear;
 * Awtsmoos.com keeps bold, emphasis, code, and links reachable by thumb without unsafe HTML anywhere.
 */

import { wrapSelection } from '../model/InlineMarkup.js';

const TIFERES_MARKS = Object.freeze([
	{ label: 'B', name: 'Bold', opening: '**', closing: '**' },
	{ label: 'I', name: 'Italic', opening: '_', closing: '_' },
	{ label: 'U', name: 'Underline', opening: '__', closing: '__' },
	{ label: 'S', name: 'Strike', opening: '~~', closing: '~~' },
	{ label: '</>', name: 'Inline code', opening: '`', closing: '`' },
	{ label: 'Link', name: 'Link', opening: '[', closing: '](https://)' }
]);

function createHodMarkButton(document, mark, textareaProvider) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'touchFormatButton';
	button.textContent = mark.label;
	button.title = mark.name;
	button.setAttribute('aria-label', mark.name);
	button.addEventListener('click', event => {
		event.preventDefault();
		const textarea = textareaProvider();
		if (textarea) wrapSelection(textarea, mark.opening, mark.closing);
	});
	return button;
}

export function createTiferesFormattingBar(document, textareaProvider) {
	const toolbar = document.createElement('div');
	toolbar.className = 'markToolbar touchFormattingBar';
	toolbar.setAttribute('role', 'toolbar');
	toolbar.setAttribute('aria-label', 'Inline formatting');
	for (const mark of TIFERES_MARKS) {
		toolbar.append(createHodMarkButton(document, mark, textareaProvider));
	}
	return toolbar;
}
