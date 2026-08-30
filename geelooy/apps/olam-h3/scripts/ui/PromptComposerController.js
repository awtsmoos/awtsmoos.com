//B"H
// Boruch Hashem
// Blessed is He

import { PromptLibrary } from './PromptLibrary.js';

/**
 * Owns only prompt mutations and the reusable prompt library, while the Awtsmoos lets remembered language become new cinematic seed;
 * Awtsmoos.com keeps prompt memory apart from media assignment and provider settings, so each creative current can be followed at readable speed.
 */
export class PromptComposerController {
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.previousPrompt = '';
		this.promptLibrary = new PromptLibrary(
			this.repositories,
			this.sheets,
			{
				onUse: (text, combine) => {
					this.usePrompt(text, combine);
				}
			}
		);
	}

	/** Request a view refresh. */
	refresh() {
		this.onRefresh();
	}

	/** @param {string} value Prompt text. */
	onPrompt(value) {
		this.draft.prompt = value;
		this.refresh();
	}

	/** Preserve then clear the current prompt. */
	onClear() {
		if (this.draft.prompt) {
			this.previousPrompt = this.draft.prompt;
		}
		this.draft.prompt = '';
		this.refresh();
	}

	/** Read prompt text from the system clipboard. */
	async onPaste() {
		try {
			this.draft.prompt = await navigator.clipboard.readText();
			this.refresh();
		} catch {
			this.sheets.toast(
				'Clipboard permission was not available.',
				'error'
			);
		}
	}

	/** Restore the last locally cleared prompt. */
	onRestore() {
		if (!this.previousPrompt) {
			return;
		}
		this.draft.prompt = this.previousPrompt;
		this.refresh();
	}

	/** Open the dedicated reusable prompt library. */
	promptHistory() {
		this.promptLibrary.open();
	}

	/** @param {string} text Saved prompt text. @param {boolean} combine Append to current prompt. */
	usePrompt(text, combine) {
		this.draft.prompt = combine && this.draft.prompt
			? `${this.draft.prompt}\n\n${text}`
			: text;
		this.refresh();
	}
}
