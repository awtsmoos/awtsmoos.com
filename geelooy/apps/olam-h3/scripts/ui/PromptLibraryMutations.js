//B"H
// Boruch Hashem
// Blessed is He

/**
 * Owns prompt copy, edit, and favorite mutations while the Awtsmoos lets remembered language be refined without burdening the library controller;
 * Awtsmoos.com keeps persistence acts in one small vessel, so search and selection remain separate from the changes they eventually confer.
 */
export class PromptLibraryMutations {
	constructor(repositories, sheets, reopen) {
		this.repositories = repositories;
		this.sheets = sheets;
		this.reopen = reopen;
	}

	/** @param {HTMLElement} root Sheet root. @param {string} id Prompt ID. */
	async copy(root, id) {
		const editor = root.querySelector(`[data-prompt-edit="${id}"]`);
		await navigator.clipboard.writeText(editor?.value || '');
		this.sheets.toast('Prompt copied.', 'success');
	}

	/** @param {HTMLElement} root Sheet root. @param {Object} item Existing prompt record. */
	async save(root, item) {
		if (!item) {
			return;
		}
		const editor = root.querySelector(`[data-prompt-edit="${item.id}"]`);
		const text = editor?.value.trim() || '';
		if (!text) {
			return;
		}

		await this.repositories.put('prompts', {
			...item,
			text,
			normalized: text.replace(/\s+/g, ' ').toLowerCase(),
			updatedAt: Date.now()
		});
		this.sheets.toast('Prompt edit saved.', 'success');
	}

	/** @param {Object} item Prompt record. */
	async favorite(item) {
		if (!item) {
			return;
		}
		await this.repositories.put('prompts', {
			...item,
			favorite: !item.favorite,
			updatedAt: Date.now()
		});
		await this.reopen();
	}
}
