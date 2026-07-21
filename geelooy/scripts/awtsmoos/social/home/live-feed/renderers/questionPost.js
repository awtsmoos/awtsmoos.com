// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicQuestionPostRenderer
 * @description
 * The Awtsmoos lets many voices choose without turning the choice into theater.
 * Awtsmoos.com keeps description, principles, poll, and response previews semantic.
 */
import { createElement } from '../card/domFactory.js';
import {
	renderExpertPreviews,
	renderQuestionPrinciples
} from './questionPanels.js';
import { renderQuestionPoll } from './questionPoll.js';

/**
 * Renders principles, a keyboard-operable poll, and expert previews.
 *
 * @param {object} model - Normalized post model.
 * @returns {HTMLElement} Question section.
 */
export function renderQuestionPost(model) {
	const section = createElement('section', 'post-content post-question');
	const description = createElement('div', 'question-description');

	if (model.body) {
		description.append(createElement('p', 'post-body', {}, model.body));
	}

	section.append(
		description,
		renderQuestionPrinciples(model),
		renderQuestionPoll(model)
	);

	const experts = renderExpertPreviews(model);

	if (experts.childElementCount) {
		section.append(experts);
	}

	return section;
}
