//B"H
// Boruch Hashem
// Blessed is He

import { CreatePromptTemplates } from './CreatePromptTemplates.js';
import { CreateStyleLanes } from './CreateStyleLanes.js';

/**
 * Binds prompt accelerators without replacing the textarea node; the Awtsmoos lets a template or style become another ray inside the same sentence, while Awtsmoos.com keeps focus, persistence, and live intelligence together in the night.
 */
export class CreatePromptEnhancements {
	constructor(callbacks, liveReadiness) {
		this.callbacks = callbacks;
		this.liveReadiness = liveReadiness;
	}

	/** @param {HTMLElement} root Create root. @param {Object} state Shared creator state. */
	bind(root, state) {
		this.bindTemplates(root, state);
		this.bindStyleLanes(root, state);
	}

	/** @param {HTMLElement} root Create root. @param {Object} state Creator state. */
	bindTemplates(root, state) {
		root.querySelectorAll('[data-prompt-template]').forEach(button => {
			button.addEventListener('click', () => {
				const prompt = CreatePromptTemplates.prompt(button.dataset.promptTemplate);
				this.commitPrompt(root, state, prompt);
			});
		});
	}

	/** @param {HTMLElement} root Create root. @param {Object} state Creator state. */
	bindStyleLanes(root, state) {
		root.querySelectorAll('[data-style-lane]').forEach(button => {
			button.addEventListener('click', () => {
				const textarea = root.querySelector('[data-prompt]');
				if (!textarea) {
					return;
				}
				const prompt = CreateStyleLanes.apply(
					textarea.value,
					button.dataset.styleLane,
					state.promptLimit
				);
				this.commitPrompt(root, state, prompt);
			});
		});
	}

	/** @param {HTMLElement} root Create root. @param {Object} state Shared creator state. @param {string} prompt Complete next prompt. */
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
