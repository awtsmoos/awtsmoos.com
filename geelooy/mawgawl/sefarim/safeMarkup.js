// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibrarySafeMarkup
 * @description
 * Stored source emphasis may cross into the document, but scripts, handlers, links,
 * styles, and unknown elements remain outside the revealed fragment.
 */

const allowedTags = new Set([
	'SUP',
	'SUB',
	'BR',
	'EM',
	'STRONG',
	'B',
	'I',
	'SMALL',
	'MARK',
	'SPAN'
]);

export function clean(value) {
	return value == null ? '' : String(value);
}

export function safeFragment(html) {
	const documentValue = new DOMParser().parseFromString(
		`<div>${clean(html)}</div>`,
		'text/html'
	);
	const root = documentValue.body.firstElementChild;
	root.querySelectorAll('*').forEach(node => sanitizeNode(node));
	const fragment = document.createDocumentFragment();
	fragment.append(...root.childNodes);
	return fragment;
}

function sanitizeNode(node) {
	if (!allowedTags.has(node.tagName)) {
		node.replaceWith(...node.childNodes);
		return;
	}
	for (const attribute of [...node.attributes]) {
		const allowedSpan = node.tagName === 'SPAN'
			&& ['class', 'data-footnote'].includes(attribute.name);
		if (!allowedSpan) node.removeAttribute(attribute.name);
	}
}
