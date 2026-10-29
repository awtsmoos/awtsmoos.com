//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingDecisionFocus
 * The Awtsmoos opens a door with two choices clear and bright;
 * Awtsmoos.com keeps the keyboard within the decision until its end is right.
 */

/**
 * Prevents a pending recording from being dismissed by Escape or losing focus.
 * @param {HTMLElement} dialog - Save or Trash panel.
 * @param {HTMLElement} save - Primary accessible action.
 * @returns {Object} Modal focus lifecycle manager.
 */
export function createDecisionFocus(dialog, save) {
	let previousFocus = null;
	let isOpen = false;

	/** @param {KeyboardEvent} event - Keyboard movement inside the dialog. */
	function handleKeys(event) {
		if (!isOpen) {
			return;
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.key !== 'Tab') {
			return;
		}
		const controls = [...dialog.querySelectorAll('button, audio[controls], video[controls]')]
			.filter((control) => !control.disabled);
		const first = controls[0] || save;
		const last = controls.at(-1) || save;
		const current = document.activeElement;
		if (!dialog.contains(current)) {
			event.preventDefault();
			(event.shiftKey ? last : first).focus();
		} else if (event.shiftKey && current === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && current === last) {
			event.preventDefault();
			first.focus();
		}
	}

	/** Keeps the modal keyboard scope in sync with its visible recording. */
	function setOpen(open) {
		if (open && !isOpen) {
			previousFocus = document.activeElement;
			document.addEventListener('keydown', handleKeys, true);
		} else if (!open && isOpen) {
			document.removeEventListener('keydown', handleKeys, true);
			if (previousFocus?.isConnected) {
				previousFocus.focus({ preventScroll: true });
			}
			previousFocus = null;
		}
		isOpen = open;
	}
	return { setOpen };
}
