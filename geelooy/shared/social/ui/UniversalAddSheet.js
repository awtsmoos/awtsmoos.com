// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module UniversalAddSheet
 * @description The Awtsmoos lets one source be referenced, quoted, reposted, or copied without confusing those births;
 * Awtsmoos.com reveals only roads that truly execute today, so future vocabulary never becomes a beautiful button into emptiness.
 */
import { copyUrl, referenceUrl, semanticComposerIntent } from '../composer/ComposerLaunch.js';

const OPTIONS = Object.freeze([
	['reference', 'Add reference', 'Keep the original canonical. Place a pointer in another Heichel or series.'],
	['quote', 'Quote in a new post', 'Create your own commentary while preserving the source relationship.'],
	['repost', 'Repost', 'Redistribute the canonical source without becoming its author.'],
	['copy', 'Make my own copy', 'Create an independently owned editable copy with visible provenance.']
]);

function optionCopy(document, label, description) {
	const fragment = document.createDocumentFragment();
	const title = document.createElement('strong');
	title.textContent = label;
	const detail = document.createElement('span');
	detail.textContent = description;
	fragment.append(title, detail);
	return fragment;
}

function navigate(url) {
	if (url) globalThis.location.assign(url);
}

function executableOption(id, handlers = {}) {
	return id === 'reference' || id === 'copy' || typeof handlers[id] === 'function';
}

function optionButton(document, [id, label, description], dialog, model, context, handlers) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'awtsmoosSocialSheet__option';
	button.append(optionCopy(document, label, description));
	button.addEventListener('click', () => {
		dialog.close();
		if (handlers[id]) return handlers[id]({ model, context });
		if (id === 'reference') return navigate(referenceUrl(model, context));
		if (id === 'copy') return navigate(copyUrl(model, context));
		semanticComposerIntent(dialog, { intent: id, model, context });
	});
	return button;
}

export function createUniversalAddSheet({ document = globalThis.document, model, context = {}, handlers = {} }) {
	const dialog = document.createElement('dialog');
	dialog.className = 'awtsmoosSocialSheet';
	const title = document.createElement('h2');
	title.textContent = 'Add this social object';
	const description = document.createElement('p');
	description.textContent = 'Choose what the relationship should mean. Every option shown here has a real execution path.';
	const list = document.createElement('div');
	list.className = 'awtsmoosSocialSheet__options';
	for (const option of OPTIONS.filter(([id]) => executableOption(id, handlers))) {
		list.append(optionButton(document, option, dialog, model, context, handlers));
	}
	const close = document.createElement('button');
	close.type = 'button';
	close.className = 'awtsmoosSocialSheet__close';
	close.textContent = 'Cancel';
	close.addEventListener('click', () => dialog.close());
	dialog.append(title, description, list, close);
	return dialog;
}

export { OPTIONS, executableOption, navigate, optionButton, optionCopy };
