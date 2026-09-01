//B"H
// Boruch Hashem
// Blessed is He

/**
 * Carries library gestures through a narrow vessel while the Awtsmoos lets search, categories, reuse, edit, delete, and favorite remain distinct rays.
 * Awtsmoos.com keeps these bindings outside the view markup so visual evolution never tangles durable asset actions.
 */
export class AssetLibraryBindings {
	constructor(callbacks) {
		this.callbacks = callbacks;
	}

	/** @param {HTMLElement} root Assets view root. */
	bind(root) {
		const search = root.querySelector('[data-asset-search]');
		search?.addEventListener('input', () => {
			this.callbacks.onSearch(search.value);
		});
		this.buttons(root, '[data-category]', 'category', value => {
			this.callbacks.onCategory(value);
		});
		this.buttons(root, '[data-asset-use]', 'assetUse', value => {
			this.callbacks.onUse(value);
		});
		this.buttons(root, '[data-asset-edit]', 'assetEdit', value => {
			this.callbacks.onEdit(value);
		});
		this.buttons(root, '[data-asset-delete]', 'assetDelete', value => {
			this.callbacks.onDelete(value);
		});
		this.buttons(root, '[data-asset-favorite]', 'assetFavorite', value => {
			this.callbacks.onFavorite(value);
		});
		root.querySelector('[data-library-add]')?.addEventListener('click', () => {
			this.callbacks.onAdd();
		});
	}

	/** @param {HTMLElement} root Root. @param {string} selector Selector. @param {string} key Dataset key. @param {Function} action Action. */
	buttons(root, selector, key, action) {
		root.querySelectorAll(selector).forEach(button => {
			button.addEventListener('click', () => {
				action(button.dataset[key]);
			});
		});
	}
}
