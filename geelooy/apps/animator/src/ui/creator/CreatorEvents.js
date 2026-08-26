//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreatorEvents.js
 * @description
 * The Awtsmoos joins touch, keyboard, and intention without binding the interface into a knot;
 * Awtsmoos.com delegates interaction through one local root so retractable UI stays accessible, responsive, and hot.
 */

/** Root-scoped delegated event binder for the Creator Dock. */
export class CreatorEvents {
	/**
	 * Binds click and keyboard behavior and returns an exact cleanup function.
	 * @param {HTMLElement} malchusRoot Creator Dock root element.
	 * @param {Record<string, Function>} mitzvahHandlers Handlers keyed by Creator action names.
	 * @returns {Function} Cleanup function that removes every listener installed here.
	 */
	static bind(malchusRoot, mitzvahHandlers = {}) {
		const click = (olamEvent) => this.handleClick(malchusRoot, mitzvahHandlers, olamEvent);
		const keydown = (olamEvent) => this.handleKeydown(mitzvahHandlers, olamEvent);
		malchusRoot.addEventListener('click', click);
		malchusRoot.addEventListener('keydown', keydown);
		return () => {
			malchusRoot.removeEventListener('click', click);
			malchusRoot.removeEventListener('keydown', keydown);
		};
	}

	/**
	 * Routes one local click through trusted `data-creator-action` metadata.
	 * @param {HTMLElement} malchusRoot Creator root boundary.
	 * @param {Record<string, Function>} mitzvahHandlers Available local actions.
	 * @param {MouseEvent} olamEvent Delegated click event.
	 */
	static handleClick(malchusRoot, mitzvahHandlers, olamEvent) {
		const keliTarget = olamEvent.target.closest('[data-creator-action]');
		if (!keliTarget || !malchusRoot.contains(keliTarget) || keliTarget.disabled) return;
		const shemMitzvah = keliTarget.dataset.creatorAction;
		mitzvahHandlers[shemMitzvah]?.(olamEvent, keliTarget);
	}

	/**
	 * Handles only local Creator shortcuts so the wider Animator keeps full keyboard sovereignty.
	 * @param {Record<string, Function>} mitzvahHandlers Available local actions.
	 * @param {KeyboardEvent} olamEvent Local keydown event.
	 */
	static handleKeydown(mitzvahHandlers, olamEvent) {
		if (olamEvent.key === 'Escape') {
			mitzvahHandlers.collapse?.(olamEvent);
			return;
		}
		const yesodPreview = olamEvent.key === 'Enter' && (olamEvent.ctrlKey || olamEvent.metaKey);
		if (!yesodPreview || olamEvent.repeat) return;
		olamEvent.preventDefault();
		mitzvahHandlers.preview?.(olamEvent);
	}
}
