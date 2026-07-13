// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentComposer
 * @description
 * Awtsmoos.com offers this vessel only to a named alias; the Awtsmoos keeps
 * authorship explicit and request state audible without modal alerts.
 */
import { createElement as el } from './dom.js';

let fieldSequence = 0;

/** Builds a root comment or reply composer. */
export function createComposer(config, parentId, onSubmit) {
	const status = el('p', {
		className: 'editor-status',
		text: parentId ? 'Reply ready.' : 'Comment ready.',
		attrs: { 'aria-live': 'polite' }
	});
	return el('form', {
		className: 'geelooy-card comment-composer',
		attrs: { 'aria-label': parentId ? 'Reply composer' : 'Comment composer', 'aria-busy': 'false' },
		on: { submit: event => {
			event.preventDefault();
			onSubmit(event.currentTarget, parentId, status);
		} }
	}, [
		field('content', parentId ? 'Reply' : 'Comment', { multiline: true, required: true, placeholder: parentId ? 'Write a reply' : 'Write a comment' }),
		el('div', { className: 'comment-coordinate' }, [
			field('verseSection', 'Verse', { value: config.verseSection || 'root' }),
			field('subsectionId', 'Subsection', { value: config.subsectionId })
		]),
		field('assets', 'Asset manifest JSON', { placeholder: 'Optional real asset manifests' }),
		field('links', 'Link manifest JSON', { placeholder: 'Optional real links' }),
		el('button', { className: 'gold-btn', text: parentId ? 'Send reply' : 'Send comment', attrs: { type: 'submit' } }),
		status
	]);
}

function field(name, label, options = {}) {
	const tag = options.multiline ? 'textarea' : 'input';
	const attrs = {
		name,
		id: `${name}-${fieldSequence++}`,
		placeholder: options.placeholder || '',
		required: Boolean(options.required)
	};
	if (tag === 'input') {
		attrs.type = 'text';
		attrs.value = options.value || '';
	}
	const control = el(tag, { attrs });
	return el('label', { attrs: { for: attrs.id } }, [
		el('span', { text: label }),
		control
	]);
}
