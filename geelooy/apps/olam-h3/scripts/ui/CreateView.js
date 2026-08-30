//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { DraftReadiness } from '../domain/DraftReadiness.js';
import { CreateAssets } from './CreateAssets.js';
import { CreateSettingsView } from './CreateSettingsView.js';
import { CreatePromptView } from './CreatePromptView.js';

/**
 * Makes creation the visual center while the Awtsmoos joins intention, reusable matter, controls, readiness, and price into one mobile flow.
 * Awtsmoos.com shows what is needed before money leaves the vessel, so the sticky Generate action remains deliberate and clear.
 */
export class CreateView {
	constructor(callbacks) {
		this.callbacks = callbacks;
		this.assets = new CreateAssets(callbacks.assets);
	}

	/** @param {Object} state Current creator state. @returns {string} View markup. */
	render(state) {
		const {
			draft,
			assets,
			estimate,
			previousPrompt
		} = state;
		const readiness = DraftReadiness.evaluate(draft, assets);

		return `
			<div class="create-view page-enter">
				${CreatePromptView.render(draft, previousPrompt)}
				${this.assets.render(draft, assets)}
				${CreateSettingsView.render(draft)}
				${this.cost(estimate, readiness)}
				<div class="generate-spacer"></div>
				${this.generate(estimate, readiness)}
			</div>`;
	}

	/** @param {Object} estimate Price estimate. @param {Object} readiness Readiness state. @returns {string} Cost markup. */
	cost(estimate, readiness) {
		return `
			<section class="cost-card">
				<div>
					<span>ESTIMATED COST</span>
					<strong>${Dom.money(estimate.total)}</strong>
					<small>${Dom.escape(readiness.message)}</small>
				</div>
				<button data-price-details>Details</button>
			</section>`;
	}

	/** @param {Object} estimate Price estimate. @param {Object} readiness Readiness state. @returns {string} Sticky action markup. */
	generate(estimate, readiness) {
		const disabled = readiness.ready ? '' : 'disabled';
		return `
			<div class="sticky-generate">
				<button class="generate-button" data-generate ${disabled}>
					<span>Generate H3 video</span>
					<strong>${Dom.money(estimate.total)}</strong>
				</button>
			</div>`;
	}

	/** @param {HTMLElement} root Render root. */
	bind(root) {
		this.assets.bind(root);
		const prompt = root.querySelector('[data-prompt]');
		prompt?.addEventListener('input', () => {
			this.callbacks.onPrompt(prompt.value);
		});
		this.bindSimpleActions(root);
		root.querySelectorAll('[data-mode]').forEach(button => {
			button.addEventListener('click', () => this.callbacks.onMode(button.dataset.mode));
		});
		root.querySelectorAll('[data-setting]').forEach(select => {
			select.addEventListener('change', () => {
				this.callbacks.onSetting(select.dataset.setting, select.value);
			});
		});
	}

	/** @param {HTMLElement} root Render root. */
	bindSimpleActions(root) {
		root.querySelector('[data-clear-prompt]')?.addEventListener('click', () => this.callbacks.onClear());
		root.querySelector('[data-paste]')?.addEventListener('click', () => this.callbacks.onPaste());
		root.querySelector('[data-restore-prompt]')?.addEventListener('click', () => this.callbacks.onRestore());
		root.querySelector('[data-prompt-history]')?.addEventListener('click', () => this.callbacks.onPromptHistory());
		root.querySelector('[data-price-details]')?.addEventListener('click', () => this.callbacks.onPriceDetails());
		root.querySelector('[data-generate]')?.addEventListener('click', () => this.callbacks.onGenerate());
	}
}
