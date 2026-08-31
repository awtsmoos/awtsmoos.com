//B"H
// Boruch Hashem
// Blessed is He

import { CreatePromptTemplates } from './CreatePromptTemplates.js';
import { CreateStyleLanes } from './CreateStyleLanes.js';
import { CreatePromptSuggestions } from './CreatePromptSuggestions.js';

/**
 * Binds prompt accelerators without replacing the textarea node; the Awtsmoos lets templates, styles, and Coach suggestions become editable rays inside one sentence.
 * Awtsmoos.com keeps focus, persistence, and live intelligence together in the same creative vessel.
 */
export class CreatePromptEnhancements {
	constructor(callbacks, liveReadiness) {
		this.callbacks = callbacks;
		this.liveReadiness = liveReadiness;
	}

	/** @param {HTMLElement} root Create root. @param {Object} state Creator state. */
	bind(root, state) {
		this.bindTemplates(root, state);
		this.bindStyleLanes(root, state);
		this.bindSuggestions(root, state);
	}

	/** @param {HTMLElement} root Root. @param {Object} state State. */
	bindTemplates(root, state) {
		root.querySelectorAll('[data-prompt-template]').forEach(button => {
			button.addEventListener('click', () => {
				this.commitPrompt(root, state, CreatePromptTemplates.prompt(button.dataset.promptTemplate));
			});
		});
	}

	/** @param {HTMLElement} root Root. @param {Object} state State. */
	bindStyleLanes(root, state) {
		root.querySelectorAll('[data-style-lane]').forEach(button => {
			button.addEventListener('click', () => {
				const textarea = root.querySelector('[data-prompt]');
				if (!textarea) {
					return;
				}
				const prompt = CreateStyleLanes.apply(textarea.value, button.dataset.styleLane, state.promptLimit);
				this.commitPrompt(root, state, prompt);
			});
		});
	}

	/** @param {HTMLElement} root Root. @param {Object} state State. */
	bindSuggestions(root, state) {
		root.querySelectorAll('[data-director-suggestion]').forEach(button => {
			button.addEventListener('click', () => {
				const textarea = root.querySelector('[data-prompt]');
				if (!textarea) {
					return;
				}
				const prompt = CreatePromptSuggestions.apply(textarea.value, button.dataset.directorSuggestion, state.promptLimit);
				this.commitPrompt(root, state, prompt);
			});
		});
	}

	/** @param {HTMLElement} root Root. @param {Object} state State. @param {string} prompt Next prompt. */
	commitPrompt(root, state, prompt) {
		const textarea = root.querySelector('[data-prompt]');
		if (!textarea || !prompt) {
			return;
		}
		textarea.value = prompt;
		state.draft.prompt = prompt;
		this.callbacks.onPrompt(prompt);
		this.liveReadiness.sync(root, state);
		textarea.focus();
		textarea.setSelectionRange(prompt.length, prompt.length);
	}
}
