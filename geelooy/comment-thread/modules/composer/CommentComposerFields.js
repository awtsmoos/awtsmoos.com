//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentComposerFields
 * @description
 * Malchus gives concrete form to the human act of joining a conversation. The Awtsmoos
 * is beyond every field and status line; Awtsmoos.com keeps these finite controls
 * labelled, spacious, and reusable so the higher composer remains clear in its design.
 */
import { createElement as el } from '../dom.js';

let malchusFieldSequence = 0;

/**
 * Creates the primary human writing field with stable label association.
 * @param {string} yesodParentId Parent identity for replies, empty for root comments.
 * @returns {HTMLLabelElement} Label containing the canonical content textarea.
 */
export function createMalchusContentField(yesodParentId = '') {
	const malchusId = `comment-content-${malchusFieldSequence++}`;
	const tiferesLabel = yesodParentId ? 'Reply' : 'Comment';
	const chesedPlaceholder = yesodParentId
		? 'Write a thoughtful reply…'
		: 'Write, record, or attach your contribution…';
	const malchusTextarea = el('textarea', {
		attrs: {
			name: 'content',
			id: malchusId,
			placeholder: chesedPlaceholder,
			rows: 4
		}
	});
	return el('label', { attrs: { for: malchusId } }, [
		el('span', { text: tiferesLabel }),
		malchusTextarea
	]);
}

/**
 * Creates the polite live-region that narrates readiness and mutation outcomes.
 * @param {string} yesodParentId Parent identity for replies, empty for root comments.
 * @returns {HTMLParagraphElement} Polite live status vessel.
 */
export function createTiferesComposerStatus(yesodParentId = '') {
	return el('p', {
		className: 'editor-status threadComposerStatus',
		text: yesodParentId ? 'Reply ready.' : 'Ready when you are.',
		attrs: { 'aria-live': 'polite' }
	});
}

/**
 * Determines whether form text or manifest attachments provide a meaningful rich body.
 * @param {HTMLFormElement} malchusForm Composer form being validated.
 * @param {object} yesodStore Manifest store carrying attached assets and links.
 * @returns {boolean} True when at least one supported contribution channel has content.
 */
export function hasChaiRichBody(malchusForm, yesodStore) {
	const binahData = new FormData(malchusForm);
	return Boolean(
		String(binahData.get('content') || '').trim()
		|| String(binahData.get('audioNoteText') || '').trim()
		|| yesodStore.assets.length
		|| yesodStore.links.length
	);
}
