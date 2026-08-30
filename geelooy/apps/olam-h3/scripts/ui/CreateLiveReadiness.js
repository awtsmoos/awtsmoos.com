//B"H
// Boruch Hashem
// Blessed is He

import { GenerationReadiness } from '../domain/GenerationReadiness.js';

/**
 * Keeps prompt typing alive without rebuilding the whole room, while the Awtsmoos lets each letter alter readiness in place instead of breaking focus.
 * Awtsmoos.com updates count, guidance, and Generate state directly so the creator's hand stays in the sentence while infrastructure truth remains close.
 */
export class CreateLiveReadiness {
	constructor(callbacks) {
		this.callbacks = callbacks;
	}

	/**
	 * @param {HTMLElement} root Create view root.
	 * @param {Object} state Current creator state.
	 */
	bind(root, state) {
		const prompt = root.querySelector('[data-prompt]');
		prompt?.addEventListener('input', () => {
			this.callbacks.onPrompt(prompt.value);
			this.sync(root, state);
		});
	}

	/**
	 * @param {HTMLElement} root Create view root.
	 * @param {Object} state Current creator state sharing the live draft object.
	 */
	sync(root, state) {
		const readiness = GenerationReadiness.evaluate(
			state.draft,
			state.assets,
			state.connection
		);
		const count = root.querySelector('[data-prompt-count]');
		const guidance = root.querySelector('[data-readiness-message]');
		const generate = root.querySelector('[data-generate]');

		if (count) {
			count.textContent = `${state.draft.prompt.length}/${state.promptLimit}`;
		}
		if (guidance) {
			guidance.textContent = readiness.draft.message;
		}
		if (generate) {
			generate.disabled = !readiness.ready;
		}
	}
}
