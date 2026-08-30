//B"H
// Boruch Hashem
// Blessed is He

import { H3_CAPABILITIES } from '../config/h3.js';
import { GenerationReadiness } from '../domain/GenerationReadiness.js';
import { CreateAssets } from './CreateAssets.js';
import { CreateSettingsView } from './CreateSettingsView.js';
import { CreatePromptView } from './CreatePromptView.js';
import { CreatePromptTemplates } from './CreatePromptTemplates.js';
import { CreateConnectionView } from './CreateConnectionView.js';
import { CreateLiveReadiness } from './CreateLiveReadiness.js';
import { CreateSubmissionView } from './CreateSubmissionView.js';

/**
 * Makes creation one readable mobile river while the Awtsmoos joins intention, references, controls, cost, and final action without overlapping layers; Awtsmoos.com keeps templates and provider truth close while every section remains independently reusable.
 */
export class CreateView {
	constructor(callbacks) {
		this.callbacks = callbacks;
		this.assets = new CreateAssets(callbacks.assets);
		this.live = new CreateLiveReadiness(callbacks);
	}

	/** @param {Object} state Current creator state. @returns {string} Create room markup. */
	render(state) {
		const readiness = GenerationReadiness.evaluate(state.draft, state.assets, state.connection);
		state.promptLimit = H3_CAPABILITIES.promptMaxCharacters;
		this.state = state;

		return `
			<div class="create-view page-enter">
				${CreatePromptView.render(state.draft, state.previousPrompt)}
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
		this.bindButtons(root);
		this.bindTemplates(root);
		root.querySelectorAll('[data-mode]').forEach(button => {
			button.addEventListener('click', () => this.callbacks.onMode(button.dataset.mode));
		});
		root.querySelectorAll('[data-setting]').forEach(select => {
			select.addEventListener('change', () => this.callbacks.onSetting(select.dataset.setting, select.value));
		});
	}

	/** @param {HTMLElement} root Create root. */
	bindTemplates(root) {
		root.querySelectorAll('[data-prompt-template]').forEach(button => {
			button.addEventListener('click', () => {
				const prompt = CreatePromptTemplates.prompt(button.dataset.promptTemplate);
				const textarea = root.querySelector('[data-prompt]');
				if (!prompt || !textarea) return;
				textarea.value = prompt;
				this.state.draft.prompt = prompt;
				this.callbacks.onPrompt(prompt);
				this.live.sync(root, this.state);
				textarea.focus();
				textarea.setSelectionRange(prompt.length, prompt.length);
			});
		});
	}

	/** @param {HTMLElement} root Create root. */
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
