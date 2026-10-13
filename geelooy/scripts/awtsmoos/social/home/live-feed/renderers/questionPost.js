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
import { renderQaAnswerSection } from './qaAnswers.js';

/**
 * Renders principles, a keyboard-operable poll, expert previews, and the
 * Quora-style answer section (ranked answers, voting, best answer, composer).
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

	// Quora-style answers: only for real question posts with an id
	if (model.id) {
		try {
			section.append(renderQaAnswerSection({
				questionId: model.id,
				heichelId: model.heichelId || 'chassidus',
				askerAliasId: model.aliasId || '',
				currentAliasId: (window.__awtsmoosAliasId || '')
			}));
		} catch { /* answers are progressive enhancement */ }
	}

	return section;
}
