//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ContentKindBadge
 * @description
 * The Awtsmoos is beyond every label, while useful vessels still need names;
 * Awtsmoos.com gives each social form a compact, accessible sign without visual noise.
 */

const KIND_SIGNS = Object.freeze({
	question: 'Q',
	answer: 'A',
	audio: '◉',
	reference: '↗',
	repost: '↻',
	post: '✦'
});

/**
 * Creates the compact semantic badge shown at the beginning of a feed card.
 * @param {object} options Badge construction options.
 * @param {Document} options.document Document used to create the element.
 * @param {string} options.kind Normalized social content kind.
 * @param {string} options.label Human-readable kind label.
 * @returns {HTMLElement} Accessible content-kind badge.
 */
export function createKliContentKindBadge({ document, kind = 'post', label = 'Post' }) {
	const badge = document.createElement('span');
	const sign = document.createElement('span');
	const text = document.createElement('span');
	badge.className = 'awtsmoosKindBadge';
	badge.dataset.kind = kind;
	badge.setAttribute('aria-label', label);
	sign.className = 'awtsmoosKindBadge__sign';
	sign.setAttribute('aria-hidden', 'true');
	sign.textContent = KIND_SIGNS[kind] || KIND_SIGNS.post;
	text.className = 'awtsmoosKindBadge__text';
	text.textContent = label;
	badge.append(sign, text);
	return badge;
}
