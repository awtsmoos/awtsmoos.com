// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderSelectedText
 * @description
 * The Awtsmoos receives a finite browser selection only when it arose inside source text or an insight;
 * Awtsmoos.com anchors related results to the reader coordinate or comment vessel, never to an invalid nested list fragment.
 */

const ELIGIBLE_SELECTOR = '#realPost, .comment-content, .inline-comment';
const COORDINATE_SELECTOR = '[data-awtsmoos-idx]';
const MAX_QUERY_LENGTH = 600;

function normalized(value) {
	return String(value || '').replace(/\s+/g, ' ').trim();
}

function selectionElement(selection) {
	const node = selection?.anchorNode;
	if (!node) return null;
	return node.nodeType === 1 ? node : node.parentElement;
}

export function selectedTextLanguage(text) {
	const value = String(text || '');
	const hasHebrew = /[\u05D0-\u05EA]/u.test(value);
	const hasLatin = /[A-Za-z]/u.test(value);
	if (hasHebrew && hasLatin) return 'mixed';
	if (hasHebrew) return 'hebrew';
	return 'english';
}

function selectionAnchor(element, root, comment) {
	if (comment) return root;
	return element.closest?.(COORDINATE_SELECTOR) || root;
}

export function selectedReaderText(selection = window.getSelection?.()) {
	if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
	const element = selectionElement(selection);
	const root = element?.closest?.(ELIGIBLE_SELECTOR);
	if (!root) return null;
	const text = normalized(selection.toString()).slice(0, MAX_QUERY_LENGTH);
	if (text.length < 2) return null;
	const comment = root.matches('.comment-content, .inline-comment');
	return {
		text,
		language: selectedTextLanguage(text),
		origin: comment ? 'comment-selection' : 'post-selection',
		anchor: selectionAnchor(element, root, comment)
	};
}

export const MAX_RELATED_QUERY_LENGTH = MAX_QUERY_LENGTH;
