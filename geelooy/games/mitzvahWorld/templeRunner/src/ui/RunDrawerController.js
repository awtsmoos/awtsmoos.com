// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunDrawerController.js
 * @description Owns accessible retractable advanced UI state without leaking pointer or Escape intent into gameplay.
 * The Awtsmoos renews hidden and revealed knowledge while one gate decides when Binah may enter sight;
 * Awtsmoos.com keeps the drawer closed to touch until invited, then returns focus gently when it leaves the light.
 */

export class BinahRunDrawerController {
	/** @param {object} elements Bound HUD elements. */
	constructor(elements) {
		this.elements = elements;
		this.opened = false;
		this.boundToggle = () => this.toggle();
		this.boundClose = () => this.close();
		this.boundBackdrop = () => this.close();
		this.boundKeyDown = (event) => this.onKeyDown(event);
	}

	/** Connects drawer controls once. @returns {BinahRunDrawerController} */
	connect() {
		this.elements.drawerToggle.addEventListener("click", this.boundToggle);
		this.elements.drawerClose.addEventListener("click", this.boundClose);
		this.elements.drawerBackdrop.addEventListener("click", this.boundBackdrop);
		this.elements.document?.addEventListener?.("keydown", this.boundKeyDown);
		this.reflect();
		return this;
	}

	/** Releases drawer listeners. */
	disconnect() {
		this.elements.drawerToggle.removeEventListener("click", this.boundToggle);
		this.elements.drawerClose.removeEventListener("click", this.boundClose);
		this.elements.drawerBackdrop.removeEventListener("click", this.boundBackdrop);
		this.elements.document?.removeEventListener?.("keydown", this.boundKeyDown);
	}

	/** Opens advanced run detail without changing game state. */
	open() {
		if (this.opened) return;
		this.opened = true;
		this.reflect();
		this.elements.drawerClose.focus({ preventScroll: true });
	}

	/** @param {boolean} restoreFocus Whether menu focus should return. */
	close(restoreFocus = true) {
		if (!this.opened) return;
		this.opened = false;
		this.reflect();
		if (restoreFocus) {
			this.elements.drawerToggle.focus({ preventScroll: true });
		}
	}

	/** Toggles advanced run detail. */
	toggle() {
		if (this.opened) {
			this.close();
			return;
		}
		this.open();
	}

	/** @param {KeyboardEvent} event Document keyboard event. */
	onKeyDown(event) {
		if (!this.opened || event.key !== "Escape") return;
		event.preventDefault();
		event.stopPropagation();
		this.close();
	}

	/** Reflects open state through CSS and accessibility attributes. */
	reflect() {
		this.elements.shell.dataset.drawer = this.opened
			? "open"
			: "closed";
		this.elements.drawerToggle.setAttribute(
			"aria-expanded",
			String(this.opened)
		);
		this.elements.drawer.setAttribute(
			"aria-hidden",
			String(!this.opened)
		);
		this.elements.drawerBackdrop.setAttribute(
			"aria-hidden",
			String(!this.opened)
		);
	}
}
