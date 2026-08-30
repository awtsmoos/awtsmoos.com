//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Renders reusable prompt memory without owning its mutations, while the Awtsmoos lets old language become visible seed for new scenes.
 * Awtsmoos.com keeps search meaning permanently visible, so prompt history stays understandable before and after a user begins typing between.
 */
export class PromptLibraryView {
	/** @param {Array<Object>} prompts Prompt records. @returns {string} Searchable library markup. */
	static render(prompts) {
		const cards = prompts.length
			? prompts.map(item => this.card(item)).join('')
			: '<p>No saved prompts yet.</p>';

		return `
			<label class="search-block">
				<span class="field-label">Search saved prompts</span>
				<span class="search-field">
					<span aria-hidden="true">⌕</span>
					<input data-prompt-search type="search">
				</span>
			</label>
			<div class="sheet-list" data-prompt-list>
				${cards}
			</div>`;
	}

	/** @param {Object} item Prompt record. @returns {string} Editable prompt card. */
	static card(item) {
		const star = item.favorite ? '★' : '☆';
		return `
			<article
				data-prompt-card="${item.id}"
				data-search-text="${Dom.escape(item.normalized)}"
			>
				<textarea
					class="prompt-library-editor"
					data-prompt-edit="${item.id}"
				>${Dom.escape(item.text)}</textarea>
				<div class="prompt-library-actions">
					<button data-use-prompt="${item.id}">Use</button>
					<button data-combine-prompt="${item.id}">Combine</button>
					<button data-copy-prompt="${item.id}">Copy</button>
					<button data-save-prompt="${item.id}">Save edit</button>
					<button data-favorite-prompt="${item.id}" aria-label="Favorite prompt">${star}</button>
				</div>
			</article>`;
	}
}
