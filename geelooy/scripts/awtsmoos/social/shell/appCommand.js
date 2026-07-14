// B"H
/**
 * @module GeelooyAppCommand
 * @description Compatibility bridge: the restored header search is now the
 * command doorway, so keyboard commands focus the real visible search lens.
 */
import { focusHeaderSearch } from './headerSearch.js';

/**
 * Preserves the former command boot contract while returning the header form.
 * @param {Document} root Active document.
 * @returns {HTMLFormElement|null} Mounted header search form.
 */
export function bindAppCommand(root = document) {
	const form = root.querySelector('[data-header-search]');
	root.querySelectorAll('[data-g-command-open]').forEach(button => {
		if (button.dataset.commandBound === 'true') return;
		button.dataset.commandBound = 'true';
		button.addEventListener('click', focusHeaderSearch);
	});
	return form;
}
