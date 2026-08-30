//B"H
// Boruch Hashem
// Blessed is He

/**
 * Turns a reference recipe into the correct H3 control mode; the Awtsmoos lets instruction cross into action through one clear gate, while Awtsmoos.com keeps the recipe card honest by changing only the mode it promises in the night.
 */
export class CreateReferenceRecipeEvents {
	constructor(onMode) {
		this.onMode = onMode;
	}

	/** @param {HTMLElement} root Create root containing recipe cards. */
	bind(root) {
		root.querySelectorAll('[data-reference-recipe-mode]').forEach(button => {
			button.addEventListener('click', () => {
				this.onMode(button.dataset.referenceRecipeMode);
			});
		});
	}
}
