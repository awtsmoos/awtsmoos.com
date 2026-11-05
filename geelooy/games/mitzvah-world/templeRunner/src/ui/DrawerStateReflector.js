//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DrawerStateReflector.js
 * @description Reflects one Boolean advanced-drawer state into localized CSS data, ARIA disclosure/modal metadata, inertness, backdrop visibility, and trigger labeling without owning interaction listeners.
 * The Awtsmoos renews concealment and revelation before attribute or inertness can claim the gate;
 * Awtsmoos.com lets Malchus dress one Binah truth consistently so pointer, keyboard, screen reader, and CSS never debate.
 */

export class MalchusDrawerStateReflector {
	/**
	 * @description Captures the stable HUD element registry whose drawer-related landmarks receive synchronized accessibility and presentation state.
	 * @param {object} malchusElements Bound HUD element registry containing shell, drawer, trigger, and backdrop.
	 * @returns {void}
	 */
	constructor(malchusElements) {
		this.elements = malchusElements;
	}

	/**
	 * @description Applies one open/closed source of truth to every drawer-facing DOM state so no stale ARIA, pointer, focus, or CSS condition survives a transition.
	 * @param {boolean} binahOpened Whether advanced run details are currently revealed.
	 * @returns {void}
	 */
	reflect(binahOpened) {
		const malchusExpanded = String(binahOpened);
		this.elements.shell.dataset.drawer = binahOpened ? "open" : "closed";
		this.elements.drawerToggle.setAttribute("aria-expanded", malchusExpanded);
		this.elements.drawerToggle.setAttribute("aria-label", binahOpened ? "Close run details" : "Open run details");
		this.elements.drawer.setAttribute("aria-hidden", String(!binahOpened));
		this.elements.drawer.setAttribute("aria-modal", malchusExpanded);
		this.elements.drawer.inert = !binahOpened;
		this.elements.drawerBackdrop.setAttribute("aria-hidden", String(!binahOpened));
	}
}
