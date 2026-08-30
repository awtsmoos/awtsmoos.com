//B"H
// Boruch Hashem
// Blessed is He

import { PromptLibraryView } from './PromptLibraryView.js';
import { PromptLibraryMutations } from './PromptLibraryMutations.js';

/**
 * Gives prompts a dedicated durable library while the Awtsmoos lets remembered language be searched, selected, and joined anew;
 * Awtsmoos.com delegates edits and favorites to a smaller vessel, so prompt navigation remains clear instead of swallowing every action too.
 */
export class PromptLibrary {
	constructor(repositories, sheets, callbacks) {
		this.repositories = repositories;
		this.sheets = sheets;
		this.callbacks = callbacks;
		this.mutations = new PromptLibraryMutations(
			repositories,
			sheets,
			() => this.open()
		);
	}

	/** Open searchable, editable, favoritable prompt history. */
	async open() {
		const prompts = await this.sortedPrompts();
		const body = PromptLibraryView.render(prompts);
		this.sheets.open('Prompt library', body, root => {
			this.bind(root, prompts);
		});
	}

	/** @returns {Promise<Array<Object>>} Favorites first, then most recently used. */
	async sortedPrompts() {
		return (await this.repositories.all('prompts')).sort((left, right) => {
			if (left.favorite !== right.favorite) {
				return Number(right.favorite) - Number(left.favorite);
			}
			return right.updatedAt - left.updatedAt;
		});
	}

	/** @param {HTMLElement} root Sheet root. @param {Array<Object>} prompts Current records. */
	bind(root, prompts) {
		const byId = new Map(prompts.map(item => [item.id, item]));
		const search = root.querySelector('[data-prompt-search]');
		search?.addEventListener('input', () => {
			this.filter(root, search.value);
		});
		this.bindUseActions(root);
		this.bindMutationActions(root, byId);
	}

	/** @param {HTMLElement} root Sheet root. */
	bindUseActions(root) {
		root.querySelectorAll('[data-use-prompt]').forEach(button => {
			button.addEventListener('click', () => {
				this.use(root, button.dataset.usePrompt, false);
			});
		});
		root.querySelectorAll('[data-combine-prompt]').forEach(button => {
			button.addEventListener('click', () => {
				this.use(root, button.dataset.combinePrompt, true);
			});
		});
		root.querySelectorAll('[data-copy-prompt]').forEach(button => {
			button.addEventListener('click', () => {
				this.mutations.copy(root, button.dataset.copyPrompt);
			});
		});
	}

	/** @param {HTMLElement} root Sheet root. @param {Map<string,Object>} byId Prompt map. */
	bindMutationActions(root, byId) {
		root.querySelectorAll('[data-save-prompt]').forEach(button => {
			button.addEventListener('click', () => {
				this.mutations.save(
					root,
					byId.get(button.dataset.savePrompt)
				);
			});
		});
		root.querySelectorAll('[data-favorite-prompt]').forEach(button => {
			button.addEventListener('click', () => {
				this.mutations.favorite(
					byId.get(button.dataset.favoritePrompt)
				);
			});
		});
	}

	/** @param {HTMLElement} root Sheet root. @param {string} query Search query. */
	filter(root, query) {
		const normalized = String(query || '').trim().toLowerCase();
		root.querySelectorAll('[data-prompt-card]').forEach(card => {
			card.hidden = !card.dataset.searchText.includes(normalized);
		});
	}

	/** @param {HTMLElement} root Sheet root. @param {string} id Prompt ID. @param {boolean} combine Combine with draft. */
	use(root, id, combine) {
		const editor = root.querySelector(`[data-prompt-edit="${id}"]`);
		const text = editor?.value.trim() || '';
		this.callbacks.onUse(text, combine);
		this.sheets.close();
	}
}
