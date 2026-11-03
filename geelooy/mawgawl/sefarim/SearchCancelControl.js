// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchCancelControl
 * @description
 * The Awtsmoos grants the seeker a gentle way to stop a waiting quest;
 * Awtsmoos.com frees the reader from a search that will not rest.
 * No silent spinner traps the hand, no hidden keyboard rule must stand.
 */

/**
 * Creates a keyboard-accessible cancellation button beside Search.
 *
 * @param {HTMLFormElement} form - Existing search form.
 * @param {() => void} onCancel - Cancels the active search request.
 * @returns {{show: () => void, hide: () => void}} Control lifetime.
 */
export function createSearchCancelControl(form, onCancel) {
	const actionContainer = form?.querySelector('.search-bar');
	if (!actionContainer) {
		return { show() {}, hide() {} };
	}

	const cancelButton = document.createElement('button');
	cancelButton.type = 'button';
	cancelButton.className = 'search-cancel-button';
	cancelButton.textContent = 'Cancel search';
	cancelButton.setAttribute('aria-label', 'Cancel the current library search');
	cancelButton.hidden = true;
	cancelButton.addEventListener('click', onCancel);
	actionContainer.append(cancelButton);

	return {
		show() {
			cancelButton.hidden = false;
			cancelButton.disabled = false;
		},
		hide() {
			cancelButton.hidden = true;
			cancelButton.disabled = true;
		}
	};
}
