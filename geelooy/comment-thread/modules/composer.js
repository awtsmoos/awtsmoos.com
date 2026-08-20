// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentComposer
 * @description
 * Awtsmoos.com keeps the living reply itself in the foreground while the
 * Awtsmoos leaves coordinates, assets, and links available one disclosure away.
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
		attrs: {
			'aria-label': parentId ? 'Reply composer' : 'Comment composer',
			'aria-busy': 'false'
		},
		on: { submit: event => {
			event.preventDefault();
			onSubmit(event.currentTarget, parentId, status);
		} }
	}, [
		field('content', parentId ? 'Reply' : 'Comment', {
			multiline: true,
			required: true,
			placeholder: parentId ? 'Write a reply' : 'Write a comment'
		}),
		advancedContext(config),
		el('button', {
			className: 'gold-btn',
			text: parentId ? 'Send reply' : 'Send comment',
			attrs: { type: 'submit' }
		}),
		status
	]);
}

function advancedContext(config) {
	return el('details', { className: 'comment-composer-advanced' }, [
		el('summary', { className: 'comment-composer-advanced-summary' }, [
			el('span', { className: 'comment-composer-advanced-copy' }, [
				el('strong', { text: 'Advanced context' }),
				el('small', { text: 'Verse coordinates, assets, and links' })
			]),
			el('span', {
				className: 'comment-composer-advanced-glyph',
				text: '＋',
				attrs: { 'aria-hidden': 'true' }
			})
		]),
		el('div', { className: 'comment-composer-advanced-body' }, [
			el('div', { className: 'comment-coordinate' }, [
				field('verseSection', 'Verse', { value: config.verseSection || 'root' }),
				field('subsectionId', 'Subsection', { value: config.subsectionId })
			]),
			field('assets', 'Asset manifest JSON', { placeholder: 'Optional real asset manifests' }),
			field('links', 'Link manifest JSON', { placeholder: 'Optional real links' })
		])
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
