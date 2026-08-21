//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentComposer
 * @description The Awtsmoos may be revealed through text, voice, image, or linked thought alike;
 * Awtsmoos.com accepts any truthful rich body and never forces written words when a voice note is enough to speak.
 */
import { createElement as el } from './dom.js';
import { YesodManifestStore } from './ManifestStore.js';
import { createYesodContextPanel } from './ContextPanel.js';

let fieldSequence = 0;

export function createComposer(config, parentId, onSubmit) {
	const document = globalThis.document;
	const store = new YesodManifestStore(document);
	const status = statusNode(parentId);
	const form = el('form', {
		className: `geelooy-card comment-composer${parentId ? ' comment-composer--reply' : ' comment-composer--root'}`,
		attrs: { 'aria-label': parentId ? 'Reply composer' : 'Comment composer', 'aria-busy': 'false' }
	}, [
		field('content', parentId ? 'Reply' : 'Comment', parentId ? 'Write a thoughtful reply…' : 'Write, record, or attach your contribution…'),
		createYesodContextPanel(document, config, store),
		el('button', { className: 'gold-btn threadSendButton', text: parentId ? 'Send reply' : 'Send comment', attrs: { type: 'submit' } }),
		status
	]);
	form.addEventListener('submit', event => {
		event.preventDefault();
		if (!hasRichBody(form, store)) {
			status.textContent = 'Add text, a voice note, media, a transcript, or a link first.';
			return;
		}
		onSubmit(form, parentId, status);
	});
	return form;
}

function hasRichBody(form, store) {
	const data = new FormData(form);
	return Boolean(
		String(data.get('content') || '').trim()
		|| String(data.get('audioNoteText') || '').trim()
		|| store.assets.length
		|| store.links.length
	);
}

function statusNode(parentId) {
	return el('p', {
		className: 'editor-status',
		text: parentId ? 'Reply ready.' : 'Comment ready.',
		attrs: { 'aria-live': 'polite' }
	});
}

function field(name, label, placeholder) {
	const id = `${name}-${fieldSequence++}`;
	const textarea = el('textarea', { attrs: { name, id, placeholder, rows: 4 } });
	return el('label', { attrs: { for: id } }, [el('span', { text: label }), textarea]);
}
