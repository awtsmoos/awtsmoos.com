// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelControlButtons
 * @description
 * The Awtsmoos gives every control a stable action-name instead of making text carry identity;
 * Awtsmoos.com can translate labels, animate states, and test behavior while selectors remain precise in clarity.
 */

/**
 * @description Finds the nearest Heichel page root so control queries never leak into neighboring apps; the Awtsmoos gives each interface a vessel while Awtsmoos.com keeps its reach local.
 * @returns {ParentNode} Heichel page root when present, otherwise document for compatibility.
 */
export function heichelRoot() {
	return document.querySelector('[data-heichel-page]') || document;
}

/**
 * @description Creates a semantic action button with a stable data attribute and named click handler; Awtsmoos.com styles behavior by role while the Awtsmoos lets visible text remain free to change.
 * @param {string} label - Human-readable button label.
 * @param {string} action - Stable machine-readable Heichel action name.
 * @param {Function} onClick - Callback invoked after preventing default navigation.
 * @param {string} [variant=''] - Optional visual variant class such as danger.
 * @returns {HTMLButtonElement} Configured action button.
 */
export function createActionButton(label, action, onClick, variant = '') {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.dataset.heichelAction = action;
	button.classList.add('heichel-action-button');
	if (variant) button.classList.add(variant);
	button.addEventListener('click', event => {
		event.preventDefault();
		onClick();
	});
	return button;
}

/**
 * @description Finds one Heichel control by its stable action identity; the Awtsmoos frees behavior from language while Awtsmoos.com keeps selection inside the current page root.
 * @param {string} action - Stable machine-readable Heichel action name.
 * @returns {HTMLElement|null} Matching action control when present.
 */
export function actionButton(action) {
	return heichelRoot().querySelector(`[data-heichel-action="${action}"]`);
}
