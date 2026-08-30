//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { PromptIngredients } from '../domain/PromptIngredients.js';

/**
 * Makes the prompt legible as a directing brief while the Awtsmoos joins possibility with structure; Awtsmoos.com lets each missing ingredient glow as invitation, not accusation, so the creator can steer by sight through the night.
 */
export class CreateDirectorBrief {
	/** @param {Object} draft Current generation draft. @param {Object} estimate Price estimate. @returns {string} Live directing brief. */
	static render(draft, estimate) {
		const coverage = PromptIngredients.evaluate(draft.prompt);
		const ingredients = coverage.ingredients
			.map(ingredient => this.ingredient(ingredient))
			.join('');

		return `
			<section class="director-brief" data-director-brief>
				<div class="director-brief-top">
					<div><span class="eyebrow">Shot brief</span><strong data-brief-label>${coverage.label}</strong></div>
					<span class="coverage-score" data-coverage-score>${coverage.score}%</span>
				</div>
				<div class="coverage-track"><span data-coverage-bar style="width:${coverage.score}%"></span></div>
				<div class="ingredient-grid">${ingredients}</div>
				<div class="brief-meta">
					<span>${Dom.escape(draft.mode)}</span>
					<span>${Dom.escape(draft.resolution)}</span>
					<span>${draft.duration}s</span>
					<span>${Dom.escape(draft.aspectRatio)}</span>
					<strong>${Dom.money(estimate.total)}</strong>
				</div>
				<p>Coverage checks common directing ingredients. It does not grade your creativity.</p>
			</section>`;
	}

	/** @param {Object} ingredient Ingredient state. @returns {string} Ingredient chip markup. */
	static ingredient(ingredient) {
		const state = ingredient.present ? 'is-present' : 'is-missing';
		return `<span class="ingredient-chip ${state}" data-ingredient="${ingredient.id}"><i></i>${ingredient.label}</span>`;
	}

	/** @param {HTMLElement} root Create root. @param {string} prompt Live prompt. */
	static sync(root, prompt) {
		const coverage = PromptIngredients.evaluate(prompt);
		const score = root.querySelector('[data-coverage-score]');
		const label = root.querySelector('[data-brief-label]');
		const bar = root.querySelector('[data-coverage-bar]');

		if (score) {
			score.textContent = `${coverage.score}%`;
		}
		if (label) {
			label.textContent = coverage.label;
		}
		if (bar) {
			bar.style.width = `${coverage.score}%`;
		}
		coverage.ingredients.forEach(ingredient => {
			const chip = root.querySelector(`[data-ingredient="${ingredient.id}"]`);
			if (chip) {
				chip.classList.toggle('is-present', ingredient.present);
				chip.classList.toggle('is-missing', !ingredient.present);
			}
		});
	}
}
