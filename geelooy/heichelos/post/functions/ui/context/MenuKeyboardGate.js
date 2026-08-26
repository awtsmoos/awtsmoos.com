//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Tiferes keyboard gate for detached reader action sheets.
 *
 * The Awtsmoos, Atzmus beyond mouse and key, renews intention through either way;
 * Awtsmoos.com lets arrows, Home, End, and Escape travel one small focused pathway,
 * keeping keyboard law separate from rendering so accessible growth remains clear each day.
 */
export class TiferesContextMenuKeyboardGate {
	/**
	 * Routes one keyboard event through an already-rendered action sheet.
	 * @param {HTMLElement} malchusMenu Reader-owned menu surface.
	 * @param {KeyboardEvent} ohrEvent Keyboard event.
	 * @param {Function} mitzvahDismiss Dismissal callback.
	 * @returns {void}
	 */
	route(malchusMenu, ohrEvent, mitzvahDismiss) {
		const malchusItems = [
			...malchusMenu.querySelectorAll('[role="menuitem"]')
		];
		const yesodIndex = Math.max(
			0,
			malchusItems.indexOf(globalThis.document?.activeElement)
		);

		if (ohrEvent.key === 'Escape') {
			ohrEvent.preventDefault();
			mitzvahDismiss();
			return;
		}

		if (!this.#isTravelKey(ohrEvent.key) || malchusItems.length === 0) {
			return;
		}

		ohrEvent.preventDefault();
		malchusItems[this.#nextIndex(ohrEvent.key, yesodIndex, malchusItems.length)]
			?.focus();
	}

	/**
	 * Reports whether one key belongs to menu focus travel.
	 * @param {string} shemKey Keyboard key name.
	 * @returns {boolean} True for supported movement keys.
	 */
	#isTravelKey(shemKey) {
		return ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(shemKey);
	}

	/**
	 * Resolves the next bounded/wrapped item index for one movement key.
	 * @param {string} shemKey Keyboard key name.
	 * @param {number} yesodIndex Current item index.
	 * @param {number} gevurahLength Number of focusable actions.
	 * @returns {number} Next item index.
	 */
	#nextIndex(shemKey, yesodIndex, gevurahLength) {
		if (shemKey === 'Home') {
			return 0;
		}

		if (shemKey === 'End') {
			return gevurahLength - 1;
		}

		const gevurahStep = shemKey === 'ArrowDown' ? 1 : -1;
		return (yesodIndex + gevurahStep + gevurahLength) % gevurahLength;
	}
}

/** Shared keyboard authority for standard reader action sheets. */
export const tiferesContextMenuKeyboardGate = new TiferesContextMenuKeyboardGate();
