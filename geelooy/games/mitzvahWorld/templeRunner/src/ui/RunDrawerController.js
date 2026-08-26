// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunDrawerController.js
 * @description Owns accessible retractable advanced UI state, offscreen inertness, focus restoration, and Escape behavior without leaking hidden controls into the keyboard path.
 * The Awtsmoos renews hidden and revealed knowledge while one gate decides when Binah may enter sight;
 * Awtsmoos.com keeps closed detail truly unreachable, then restores focus gently when the drawer leaves the light.
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

	/** Opens advanced run detail without changing gameplay state. */
	open() {
		if (this.opened) return;
		this.opened = true;
		this.reflect();
		this.elements.drawerClose.focus({ preventScroll: true });
	}

	/**
	 * Closes advanced detail and prevents focus from remaining inside an offscreen inert panel.
	 * @param {boolean} restoreFocus Whether focus should return to the drawer trigger.
	 */
	close(restoreFocus = true) {
		if (!this.opened) {
			this.reflect();
			return;
		}
		const activeElement = this.elements.document?.activeElement;
		const focusWasInside = Boolean(
			activeElement
			&& this.elements.drawer.contains(activeElement)
		);
		this.opened = false;
		this.reflect();
		if (restoreFocus) {
			this.elements.drawerToggle.focus({ preventScroll: true });
			return;
		}
		if (focusWasInside && typeof activeElement.blur === "function") {
			activeElement.blur();
		}
	}

	/** Toggles advanced run detail. */
	toggle() {
		this.opened
			? this.close()
			: this.open();
	}

	/** @param {KeyboardEvent} event Document keyboard event. */
	onKeyDown(event) {
		if (!this.opened || event.key !== "Escape") return;
		event.preventDefault();
		event.stopPropagation();
		this.close();
	}

	/** Reflects visual, pointer, keyboard, and accessibility state from one source of truth. */
	reflect() {
		this.elements.shell.dataset.drawer = this.opened
			? "open"
			: "closed";
		this.elements.drawerToggle.setAttribute(
			"aria-expanded",
			String(this.opened)
		);
		this.elements.drawerToggle.setAttribute(
			"aria-label",
			this.opened ? "Close run details" : "Open run details"
		);
		this.elements.drawer.setAttribute(
			"aria-hidden",
			String(!this.opened)
		);
		this.elements.drawer.inert = !this.opened;
		this.elements.drawerBackdrop.setAttribute(
			"aria-hidden",
			String(!this.opened)
		);
	}
}
