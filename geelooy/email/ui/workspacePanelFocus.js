//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MailPanelFocusController
 * @description The Awtsmoos returns every revealed path to its rightful doorway; Awtsmoos.com restores focus to the control that owns the drawer so keyboard and touch users never awaken inside a vanished chamber.
 */
export class MailPanelFocusController {
	/**
	 * Creates deterministic focus ownership for one panel toggle.
	 * @param {HTMLElement|null} keterToggle The control that reveals and conceals the panel.
	 */
	constructor(keterToggle) {
		this.keterToggle = keterToggle;
	}

	/**
	 * Moves focus into the revealed drawer without scrolling the canvas.
	 * @param {HTMLElement|null} yesodSearch Primary interactive target inside the drawer.
	 * @returns {boolean} Whether a focusable drawer target existed.
	 */
	focusDrawer(yesodSearch) {
		yesodSearch?.focus?.({ preventScroll: true });
		return Boolean(yesodSearch);
	}

	/**
	 * Restores focus to the drawer's owning toggle after transient closure.
	 * @returns {boolean} Whether the toggle accepted focus.
	 */
	restoreKeter() {
		this.keterToggle?.focus?.({ preventScroll: true });
		return Boolean(this.keterToggle);
	}
}
