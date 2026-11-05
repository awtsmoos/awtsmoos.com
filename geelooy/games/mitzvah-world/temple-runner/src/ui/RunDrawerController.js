//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunDrawerController.js
 * @description Owns only advanced-detail disclosure transitions and immutable evidence while event binding, keyboard policy, DOM reflection, and close-time focus restoration live in dedicated vessels.
 * The Awtsmoos renews hidden and revealed knowledge while one Binah gate decides when depth may enter sight;
 * Awtsmoos.com lets Netzach bind, Hod interpret, Malchus reflect, and Yesod restore while Binah keeps one disclosure light.
 */

import { NetzachDrawerEventBindings } from "./DrawerEventBindings.js";
import { YesodDrawerFocusRestorer } from "./DrawerFocusRestorer.js";
import { HodDrawerKeyboardPolicy } from "./DrawerKeyboardPolicy.js";
import { MalchusDrawerStateReflector } from "./DrawerStateReflector.js";

export class BinahRunDrawerController {
	/**
	 * @description Captures stable drawer landmarks and composes reflection, event, keyboard, and focus-restoration vessels around one disclosure Boolean.
	 * @param {object} binahElements Bound HUD elements containing drawer, trigger, close button, backdrop, shell, and owning document.
	 * @returns {void}
	 */
	constructor(binahElements) {
		this.elements = binahElements;
		this.reflector = new MalchusDrawerStateReflector(binahElements);
		this.focusRestorer = new YesodDrawerFocusRestorer(binahElements);
		this.opened = false;
		this.keyboard = new HodDrawerKeyboardPolicy(
			binahElements.drawer,
			() => this.opened,
			() => this.close()
		);
		this.bindings = new NetzachDrawerEventBindings(binahElements, {
			toggle: () => this.toggle(),
			close: () => this.close(),
			backdrop: () => this.close(),
			keyDown: (hodEvent) => this.keyboard.handle(hodEvent)
		});
	}

	/**
	 * @description Connects drawer listeners through the Netzach binding vessel and synchronizes initial presentation through one Malchus reflector.
	 * @returns {BinahRunDrawerController} This connected controller for composition chaining.
	 */
	connect() {
		this.bindings.connect();
		this.reflect();
		return this;
	}

	/**
	 * @description Removes all drawer-owned interaction listeners without altering disclosure state or unrelated route input listeners.
	 * @returns {void}
	 */
	disconnect() {
		this.bindings.disconnect();
	}

	/**
	 * @description Reveals advanced detail once, reflects modal/inert state, and moves focus into the explicit close affordance without scrolling the game viewport.
	 * @returns {boolean} True only when this call changed closed state to open.
	 */
	open() {
		if (this.opened) return false;
		this.opened = true;
		this.reflect();
		this.elements.drawerClose.focus({ preventScroll: true });
		return true;
	}

	/**
	 * @description Conceals advanced detail once, reflects inert state, and delegates safe focus restoration/release to the Yesod focus vessel.
	 * @param {boolean} [binahRestoreFocus=true] Whether focus should return to the drawer trigger after closure.
	 * @returns {boolean} True only when this call changed open state to closed.
	 */
	close(binahRestoreFocus = true) {
		if (!this.opened) return false;
		const yesodActive = this.elements.document.activeElement;
		this.opened = false;
		this.reflect();
		this.focusRestorer.afterClose(binahRestoreFocus, yesodActive);
		return true;
	}

	/**
	 * @description Switches disclosure only through canonical open/close transitions so focus and accessibility side effects remain consistent.
	 * @returns {boolean} New open state after the toggle completes.
	 */
	toggle() {
		this.opened ? this.close() : this.open();
		return this.opened;
	}

	/**
	 * @description Reveals detached disclosure evidence for public presentation and UI-discovery snapshots without exposing mutable controller or DOM references.
	 * @returns {object} JSON-compatible details-open Boolean and compact/advanced mode id.
	 */
	snapshot() {
		return {
			detailsOpen: this.opened,
			mode: this.opened ? "advanced" : "compact"
		};
	}

	/**
	 * @description Delegates CSS, ARIA, inert, backdrop, and trigger-label reflection to the Malchus reflector using the controller's single Boolean truth.
	 * @returns {void}
	 */
	reflect() {
		this.reflector.reflect(this.opened);
	}
}
