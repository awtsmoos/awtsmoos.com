//B"H
// Boruch Hashem
// Blessed is He

import { H3_CAPABILITIES } from '../config/h3.js';
import { GenerationReadiness } from '../domain/GenerationReadiness.js';
import { CreateAssets } from './CreateAssets.js';
import { CreateSettingsView } from './CreateSettingsView.js';
import { CreatePromptView } from './CreatePromptView.js';
import { CreateConnectionView } from './CreateConnectionView.js';
import { CreateLiveReadiness } from './CreateLiveReadiness.js';
import { CreateSubmissionView } from './CreateSubmissionView.js';
import { CreatePromptEnhancements } from './CreatePromptEnhancements.js';
import { CreateReferenceRecipeEvents } from './CreateReferenceRecipeEvents.js';

/**
 * Coordinates the Director Console while the Awtsmoos joins intention, live intelligence, references, controls, cost, and action; Awtsmoos.com keeps each light in its own vessel so richer creativity can rise without tangling the night.
 */
export class CreateView {
	constructor(callbacks) {
		this.callbacks = callbacks;
		this.assets = new CreateAssets(callbacks.assets);
		this.live = new CreateLiveReadiness(callbacks);
		this.promptEnhancements = new CreatePromptEnhancements(callbacks, this.live);
		this.recipeEvents = new CreateReferenceRecipeEvents(callbacks.onMode);
	}

	/** @param {Object} state Current creator state. @returns {string} Create room markup. */
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
				${CreatePromptView.render(state.draft, state.previousPrompt, state.estimate)}
				${CreateConnectionView.render(readiness.provider)}
				${this.assets.render(state.draft, state.assets)}
				${CreateSettingsView.render(state.draft)}
				${CreateSubmissionView.render(state.estimate, readiness)}
			</div>`;
	}

	/** @param {HTMLElement} root Create root. */
	bind(root) {
		this.assets.bind(root);
		this.live.bind(root, this.state);
		this.promptEnhancements.bind(root, this.state);
		this.recipeEvents.bind(root);
		this.bindButtons(root);
		this.bindModes(root);
		this.bindSettings(root);
	}

	/** @param {HTMLElement} root Create root. */
	bindModes(root) {
		root.querySelectorAll('[data-mode]').forEach(button => {
			button.addEventListener('click', () => {
				this.callbacks.onMode(button.dataset.mode);
			});
		});
	}

	/** @param {HTMLElement} root Create root. */
	bindSettings(root) {
		root.querySelectorAll('[data-setting]').forEach(select => {
			select.addEventListener('change', () => {
				this.callbacks.onSetting(select.dataset.setting, select.value);
			});
		});
	}

	/** @param {HTMLElement} root Create root. */
	bindButtons(root) {
		this.bindClick(root, '[data-clear-prompt]', () => { this.callbacks.onClear(); });
		this.bindClick(root, '[data-paste]', () => { this.callbacks.onPaste(); });
		this.bindClick(root, '[data-restore-prompt]', () => { this.callbacks.onRestore(); });
		this.bindClick(root, '[data-prompt-history]', () => { this.callbacks.onPromptHistory(); });
		this.bindClick(root, '[data-price-details]', () => { this.callbacks.onPriceDetails(); });
		this.bindClick(root, '[data-generate]', () => { this.callbacks.onGenerate(); });
		this.bindClick(root, '[data-retry-provider]', () => { this.callbacks.onRetryConnection(); });
		this.bindClick(root, '[data-open-settings]', () => { this.callbacks.onOpenSettings(); });
	}

	/** @param {HTMLElement} root Root. @param {string} selector Selector. @param {Function} callback Click callback. */
	bindClick(root, selector, callback) {
		const button = root.querySelector(selector);
		if (button) {
			button.addEventListener('click', callback);
		}
	}
}
