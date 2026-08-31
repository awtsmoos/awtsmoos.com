//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { PromptIngredients } from '../domain/PromptIngredients.js';

/**
 * Compresses prompt intelligence into an actionable Director Coach while the Awtsmoos turns absence into invitation rather than judgment.
 * Awtsmoos.com lets every missing ingredient become a small door the creator may open with one tap.
 */
export class CreateDirectorBrief {
	/** @param {Object} draft Draft. @param {Object} estimate Price estimate. @returns {string} Compact coach markup. */
	static render(draft, estimate) {
		const coverage = PromptIngredients.evaluate(draft.prompt);
		const ingredients = coverage.ingredients
			.map(ingredient => this.ingredient(ingredient))
			.join('');

		return `
			<section class="director-brief" data-director-brief>
				<div class="director-brief-top">
					<div><span class="eyebrow">Director Coach</span><strong data-brief-label>${coverage.label}</strong></div>
					<span class="coverage-score" data-coverage-score>${coverage.score}%</span>
				</div>
				<div class="coverage-track"><span data-coverage-bar style="width:${coverage.score}%"></span></div>
				<div class="ingredient-grid">${ingredients}</div>
				<details class="brief-details">
					<summary>Why these?</summary>
					<div class="brief-meta">
						<span>${Dom.escape(draft.mode)}</span><span>${Dom.escape(draft.resolution)}</span>
						<span>${draft.duration}s</span><span>${Dom.escape(draft.aspectRatio)}</span><strong>${Dom.money(estimate.total)}</strong>
					</div>
					<p>Coverage checks common directing ingredients. It never grades your creativity.</p>
				</details>
			</section>`;
	}

	/** @param {Object} ingredient Ingredient state. @returns {string} Actionable ingredient chip. */
	static ingredient(ingredient) {
		const state = ingredient.present ? 'is-present' : 'is-missing';
		const disabled = ingredient.present ? 'disabled' : '';
		const status = ingredient.present ? '✓' : '+ Add';
		return `<button type="button" class="ingredient-chip ${state}" data-ingredient="${ingredient.id}" data-director-suggestion="${ingredient.id}" ${disabled}><i></i><span>${ingredient.label}</span><small>${status}</small></button>`;
	}

	/** @param {HTMLElement} root Create root. @param {string} prompt Live prompt. */
	static sync(root, prompt) {
		const coverage = PromptIngredients.evaluate(prompt);
		this.text(root, '[data-coverage-score]', `${coverage.score}%`);
		this.text(root, '[data-brief-label]', coverage.label);
		const bar = root.querySelector('[data-coverage-bar]');
		if (bar) {
			bar.style.width = `${coverage.score}%`;
		}
		coverage.ingredients.forEach(ingredient => this.syncIngredient(root, ingredient));
	}

	/** @param {HTMLElement} root Root. @param {Object} ingredient Ingredient state. */
	static syncIngredient(root, ingredient) {
		const chip = root.querySelector(`[data-ingredient="${ingredient.id}"]`);
		if (!chip) {
			return;
		}
		chip.classList.toggle('is-present', ingredient.present);
		chip.classList.toggle('is-missing', !ingredient.present);
		chip.disabled = ingredient.present;
		const status = chip.querySelector('small');
		if (status) {
			status.textContent = ingredient.present ? '✓' : '+ Add';
		}
	}

	/** @param {HTMLElement} root Root. @param {string} selector Selector. @param {string} value Text. */
	static text(root, selector, value) {
		const node = root.querySelector(selector);
		if (node) {
			node.textContent = value;
		}
	}
}
