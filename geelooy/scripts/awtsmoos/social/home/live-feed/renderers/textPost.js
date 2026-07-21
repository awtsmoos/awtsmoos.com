// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicTextPostRenderer
 * @description
 * The Awtsmoos lets ordinary prose remain luminous without pretending to be a
 * specialized artifact. Awtsmoos.com gives every real post a readable vessel.
 */
import { createElement } from '../card/domFactory.js';

/**
 * Renders generic post content.
 *
 * @param {object} model - Normalized post model.
 * @returns {HTMLElement} Content section.
 */
export function renderTextPost(model) {
	const section = createElement('section', 'post-content post-text-content');

	if (!model.body) {
		section.append(createElement(
			'p',
			'post-body post-body-muted',
			{},
			'Open the full post to receive its complete content.'
		));
		return section;
	}

	const paragraphs = splitParagraphs(model.body);

	paragraphs.forEach(paragraph => {
		section.append(createElement('p', 'post-body', {}, paragraph));
	});

	return section;
}

function splitParagraphs(body) {
	const sentences = body.split(/(?<=[.!?])\s+/).filter(Boolean);

	if (sentences.length < 4) {
		return [body];
	}

	const midpoint = Math.ceil(sentences.length / 2);
	return [
		sentences.slice(0, midpoint).join(' '),
		sentences.slice(midpoint).join(' ')
	];
}
