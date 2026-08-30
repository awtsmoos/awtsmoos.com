//B"H
// Boruch Hashem
// Blessed is He

import { GenerationReadiness } from '../domain/GenerationReadiness.js';
import { CreateDirectorBrief } from './CreateDirectorBrief.js';

/**
 * Keeps typing alive without rebuilding the room while the Awtsmoos lets each letter change both safety and creative coverage in place; Awtsmoos.com updates readiness and the Shot Brief together, line by line, so focus remains steady in the night.
 */
export class CreateLiveReadiness {
	constructor(callbacks) {
		this.callbacks = callbacks;
	}

	/** @param {HTMLElement} root Create view root. @param {Object} state Current creator state. */
	bind(root, state) {
		const prompt = root.querySelector('[data-prompt]');
		prompt?.addEventListener('input', () => {
			this.callbacks.onPrompt(prompt.value);
			this.sync(root, state);
		});
	}

	/** @param {HTMLElement} root Create root. @param {Object} state State sharing the live draft object. */
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
		CreateDirectorBrief.sync(root, state.draft.prompt);
	}
}
