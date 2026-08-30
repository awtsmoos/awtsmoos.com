//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { H3_CAPABILITIES } from '../config/h3.js';
import { GenerationReadiness } from '../domain/GenerationReadiness.js';
import { CreateAssets } from './CreateAssets.js';
import { CreateSettingsView } from './CreateSettingsView.js';
import { CreatePromptView } from './CreatePromptView.js';
import { CreateConnectionView } from './CreateConnectionView.js';
import { CreateLiveReadiness } from './CreateLiveReadiness.js';

/**
 * Makes creation the visual center while the Awtsmoos joins intention, reusable matter, provider truth, controls, readiness, and price into one mobile flow.
 * Awtsmoos.com reveals blocked infrastructure before submission and preserves uninterrupted prompt focus while every local creative vessel remains usable.
 */
export class CreateView {
	constructor(callbacks) {
		this.callbacks = callbacks;
		this.assets = new CreateAssets(callbacks.assets);
		this.live = new CreateLiveReadiness(callbacks);
	}

	/** @param {Object} state Current creator state. @returns {string} View markup. */
	render(state) {
		const readiness = GenerationReadiness.evaluate(
			state.draft,
			state.assets,
			state.connection
		);
		state.promptLimit = H3_CAPABILITIES.promptMaxCharacters;
		this.state = state;

		return `
			<div class="create-view page-enter">
				${CreatePromptView.render(state.draft, state.previousPrompt)}
				${CreateConnectionView.render(readiness.provider)}
				${this.assets.render(state.draft, state.assets)}
				${CreateSettingsView.render(state.draft)}
				${this.cost(state.estimate, readiness.draft)}
				<div class="generate-spacer"></div>
				${this.generate(state.estimate, readiness.ready)}
			</div>`;
	}

	/** @param {Object} estimate Price estimate. @param {Object} draftState Draft readiness. @returns {string} */
	cost(estimate, draftState) {
		return `
			<section class="cost-card">
				<div>
					<span>ESTIMATED COST</span>
					<strong>${Dom.money(estimate.total)}</strong>
					<small data-readiness-message>${Dom.escape(draftState.message)}</small>
				</div>
				<button data-price-details>Details</button>
			</section>`;
	}

	/** @param {Object} estimate Price estimate. @param {boolean} ready Combined readiness. @returns {string} */
	generate(estimate, ready) {
		return `
			<div class="sticky-generate">
				<button class="generate-button" data-generate ${ready ? '' : 'disabled'}>
					<span>Generate H3 video</span>
					<strong>${Dom.money(estimate.total)}</strong>
				</button>
			</div>`;
	}

	/** @param {HTMLElement} root Render root. */
	bind(root) {
		this.assets.bind(root);
		this.live.bind(root, this.state);
		this.bindButtons(root);
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
	bindButtons(root) {
		root.querySelector('[data-clear-prompt]')?.addEventListener('click', () => this.callbacks.onClear());
		root.querySelector('[data-paste]')?.addEventListener('click', () => this.callbacks.onPaste());
		root.querySelector('[data-restore-prompt]')?.addEventListener('click', () => this.callbacks.onRestore());
		root.querySelector('[data-prompt-history]')?.addEventListener('click', () => this.callbacks.onPromptHistory());
		root.querySelector('[data-price-details]')?.addEventListener('click', () => this.callbacks.onPriceDetails());
		root.querySelector('[data-generate]')?.addEventListener('click', () => this.callbacks.onGenerate());
		root.querySelector('[data-retry-provider]')?.addEventListener('click', () => this.callbacks.onRetryConnection());
		root.querySelector('[data-open-settings]')?.addEventListener('click', () => this.callbacks.onOpenSettings());
	}
}
