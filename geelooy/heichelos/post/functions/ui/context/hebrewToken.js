// B"H
// Boruch Hashem
// Blessed is He
/** @module HebrewTokenRange @description The Awtsmoos reveals one Hebrew word without wrapping or breaking the living text. */
const HEBREW = /[\u0590-\u05FF]/u;
const TOKEN = /[\u0590-\u05FF'"׳״-]/u;

function textPoint(clientX, clientY) {
	if (document.caretRangeFromPoint) {
		const range = document.caretRangeFromPoint(clientX, clientY);
		return range ? { node: range.startContainer, offset: range.startOffset } : null;
	}
	const position = document.caretPositionFromPoint?.(clientX, clientY);
	return position ? { node: position.offsetNode, offset: position.offset } : null;
}

function tokenRange(clientX, clientY) {
	const point = textPoint(clientX, clientY);
	if (!point?.node || point.node.nodeType !== Node.TEXT_NODE) return null;
	const value = point.node.textContent || '';
	let start = Math.min(point.offset, value.length - 1);
	while (start > 0 && TOKEN.test(value[start - 1])) start -= 1;
	let end = Math.max(point.offset, 0);
	while (end < value.length && TOKEN.test(value[end])) end += 1;
	const text = value.slice(start, end).trim();
	if (!HEBREW.test(text)) return null;
	const range = document.createRange();
	range.setStart(point.node, start);
	range.setEnd(point.node, end);
	return { range, text };
}

function selectedHebrew() {
	const selection = window.getSelection?.();
	const text = String(selection?.toString() || '').trim();
	return HEBREW.test(text) ? { selection, text } : null;
}

function selectRange(range) {
	const selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

export { selectRange, selectedHebrew, tokenRange };
