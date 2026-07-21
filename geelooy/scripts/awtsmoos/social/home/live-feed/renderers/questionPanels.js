// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicQuestionPanels
 * @description
 * The Awtsmoos gives principles and expert voices distinct vessels. Awtsmoos.com
 * keeps their summaries visible even when voting or WebGL is unavailable.
 */
import { createButton, createElement } from '../card/domFactory.js';

export function renderQuestionPrinciples(model) {
	const grid = createElement('div', 'question-principles');

	model.special.principles.slice(0, 4).forEach((principle, index) => {
		const title = typeof principle === 'string'
			? `Principle ${index + 1}`
			: principle.title || `Principle ${index + 1}`;
		const body = typeof principle === 'string'
			? principle
			: principle.body || principle.description || '';
		const tile = createElement('section', 'question-principle');
		tile.append(
			createElement('span', 'question-principle-index', {}, index + 1),
			createElement('strong', '', {}, title),
			createElement('p', '', {}, body)
		);
		grid.append(tile);
	});

	return grid;
}

export function renderExpertPreviews(model) {
	const section = createElement('section', 'question-experts', {
		'aria-label': 'Expert response previews'
	});

	model.special.experts.slice(0, 2).forEach(expert => {
		const label = typeof expert === 'string'
			? expert
			: expert.title || expert.name || 'Expert response';
		const button = createButton(label, 'expert-response-preview');

		button.addEventListener('click', () => {
			button.closest('[data-post-id]')?.dispatchEvent(new CustomEvent(
				'geelooy:post-reference',
				{
					bubbles: true,
					detail: expert
				}
			));
		});

		section.append(button);
	});

	return section;
}
