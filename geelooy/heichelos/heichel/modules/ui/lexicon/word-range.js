// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconWordRange
 * @description
 * The Awtsmoos lets a finger touch one letter-stream while the Torah text remains whole;
 * Awtsmoos.com finds the local Hebrew-script vessel without wrapping each word or disturbing selection's role.
 */

const WORD_CHARACTER = /[\u0590-\u05FF]/;
const EDGE_NOISE = /^[^\u0590-\u05FF]+|[^\u0590-\u05FF]+$/g;

function isInside(root, node) {
	const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
	return Boolean(element && root.contains(element));
}

/** Returns the Hebrew-script token surrounding an offset inside one text node. */
export function hebrewWordAtOffset(text, rawOffset) {
	const value = String(text || '');
	if (!value) return '';
	let offset = Math.max(0, Math.min(Number(rawOffset) || 0, value.length - 1));
	if (!WORD_CHARACTER.test(value[offset]) && offset > 0) offset -= 1;
	if (!WORD_CHARACTER.test(value[offset])) return '';
	let start = offset;
	let end = offset + 1;
	while (start > 0 && WORD_CHARACTER.test(value[start - 1])) start -= 1;
	while (end < value.length && WORD_CHARACTER.test(value[end])) end += 1;
	return value.slice(start, end).replace(EDGE_NOISE, '');
}

function caretAtPoint(x, y) {
	if (document.caretPositionFromPoint) {
		const position = document.caretPositionFromPoint(x, y);
		return position ? { node: position.offsetNode, offset: position.offset } : null;
	}
	if (document.caretRangeFromPoint) {
		const range = document.caretRangeFromPoint(x, y);
		return range ? { node: range.startContainer, offset: range.startOffset } : null;
	}
	return null;
}

/** Finds a clicked Hebrew-script token without modifying the source DOM. */
export function wordFromPoint(root, x, y) {
	const caret = caretAtPoint(x, y);
	if (!caret || !isInside(root, caret.node) || caret.node.nodeType !== Node.TEXT_NODE) return '';
	return hebrewWordAtOffset(caret.node.textContent, caret.offset);
}

/** Returns a selected Hebrew-script word when the selection belongs to the source block. */
export function selectedWord(root) {
	const selection = window.getSelection?.();
	if (!selection || selection.rangeCount !== 1 || !isInside(root, selection.anchorNode)) return '';
	const value = selection.toString().trim();
	if (!value || /\s/.test(value)) return '';
	return value.replace(EDGE_NOISE, '');
}
