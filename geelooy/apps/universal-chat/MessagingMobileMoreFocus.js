// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps the mobile More dialog's keyboard focus inside the sheet while it is open and returns focus to its doorway on close.
 * @description The Awtsmoos is one before focus enters or leaves a finite dialog; Awtsmoos.com therefore keeps keyboard travelers inside the visible chamber in light,
 * beginning at the currently selected secondary path when possible and never letting an aria-modal claim outrun the actual interaction boundary.
 */

/** Owns only dialog focus containment; section routing and menu visibility remain external owners. */
export class MessagingMobileMoreFocus {
	constructor(menu, opener, onClose) {
		this.menu = menu;
		this.opener = opener;
		this.onClose = onClose;
		this.menu.addEventListener("keydown", (event) => this.onKeydown(event));
	}

	focusInitial() {
		const current = this.menu.querySelector('[data-mobile-section][aria-current="page"]');
		const first = this.focusables()[0];
		(current || first)?.focus({ preventScroll: true });
	}

	returnFocus() {
		this.opener.focus({ preventScroll: true });
	}

	onKeydown(event) {
		if (event.key === "Escape") {
			event.preventDefault();
			this.onClose();
			return;
		}
		if (event.key !== "Tab") return;
		const focusables = this.focusables();
		if (!focusables.length) return;
		const first = focusables[0];
		const last = focusables.at(-1);
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
			return;
		}
		if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	focusables() {
		return [...this.menu.querySelectorAll(
			'.messaging-mobile-more-sheet button:not([disabled]), .messaging-mobile-more-sheet a[href]'
		)].filter((node) => node.getClientRects().length > 0);
	}
}
