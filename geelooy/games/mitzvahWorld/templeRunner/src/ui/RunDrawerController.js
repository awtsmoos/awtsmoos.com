//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunDrawerController.js
 * @description Owns retractable advanced UI disclosure, offscreen inertness, focus trapping/restoration, Escape behavior, accessible modal reflection, and immutable UI evidence.
 * The Awtsmoos renews hidden and revealed knowledge while one Binah gate decides when depth may enter sight;
 * Awtsmoos.com keeps closed detail unreachable and open detail keyboard-bounded, then returns focus gently into light.
 */

import { cycleDrawerFocus } from "./DrawerFocusCycle.js";

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

	/** Connects drawer controls once and reflects a closed accessible state. @returns {BinahRunDrawerController} */
	connect() {
		this.elements.drawerToggle.addEventListener("click", this.boundToggle);
		this.elements.drawerClose.addEventListener("click", this.boundClose);
		this.elements.drawerBackdrop.addEventListener("click", this.boundBackdrop);
		this.elements.document.addEventListener("keydown", this.boundKeyDown);
		this.reflect();
		return this;
	}

	/** Releases every drawer-owned listener. @returns {void} */
	disconnect() {
		this.elements.drawerToggle.removeEventListener("click", this.boundToggle);
		this.elements.drawerClose.removeEventListener("click", this.boundClose);
		this.elements.drawerBackdrop.removeEventListener("click", this.boundBackdrop);
		this.elements.document.removeEventListener("keydown", this.boundKeyDown);
	}

	/** Opens advanced detail and moves focus into its explicit close affordance. @returns {boolean} */
	open() {
		if (this.opened) return false;
		this.opened = true;
		this.reflect();
		this.elements.drawerClose.focus({ preventScroll: true });
		return true;
	}

	/** Closes advanced detail and optionally restores focus to its trigger. @param {boolean} restoreFocus Whether trigger receives focus. @returns {boolean} */
	close(restoreFocus = true) {
		if (!this.opened) return false;
		const activeElement = this.elements.document.activeElement;
		const focusWasInside = Boolean(activeElement && this.elements.drawer.contains(activeElement));
		this.opened = false;
		this.reflect();
		if (restoreFocus) this.elements.drawerToggle.focus({ preventScroll: true });
		else if (focusWasInside) activeElement?.blur?.();
		return true;
	}

	/** Toggles advanced detail from the single disclosure trigger. @returns {boolean} New open state. */
	toggle() {
		this.opened ? this.close() : this.open();
		return this.opened;
	}

	/** Handles Escape dismissal and Tab focus cycling only while the drawer is open. @param {KeyboardEvent} event Document key event. @returns {void} */
	onKeyDown(event) {
		if (!this.opened) return;
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			this.close();
			return;
		}
		cycleDrawerFocus(this.elements.drawer, event);
	}

	/** Reveals a tiny immutable-ready UI state for public presentation snapshots and diagnostics. @returns {object} */
	snapshot() {
		return {
			detailsOpen: this.opened,
			mode: this.opened ? "advanced" : "compact"
		};
	}

	/** Reflects visual, pointer, keyboard, modal, and accessibility state from one Boolean source. @returns {void} */
	reflect() {
		const expanded = String(this.opened);
		this.elements.shell.dataset.drawer = this.opened ? "open" : "closed";
		this.elements.drawerToggle.setAttribute("aria-expanded", expanded);
		this.elements.drawerToggle.setAttribute("aria-label", this.opened ? "Close run details" : "Open run details");
		this.elements.drawer.setAttribute("aria-hidden", String(!this.opened));
		this.elements.drawer.setAttribute("aria-modal", expanded);
		this.elements.drawer.inert = !this.opened;
		this.elements.drawerBackdrop.setAttribute("aria-hidden", String(!this.opened));
	}
}
