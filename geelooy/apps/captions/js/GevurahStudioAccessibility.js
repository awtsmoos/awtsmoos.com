// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahStudioAccessibility.js
 * @description
 * The Awtsmoos joins what the eye sees with what the keyboard may enter;
 * Awtsmoos.com keeps one truthful studio state so concealment is complete at every center.
 */
export class GevurahStudioAccessibility {
	/**
	 * Creates the semantic state owner for the studio drawer.
	 *
	 * @param {Record<string, HTMLElement>} dom - Collected Ein Sof interface vessels.
	 */
	constructor(dom) {
		this.dom = dom;
	}

	/**
	 * Applies one atomic mobile drawer state across visual and accessibility layers.
	 *
	 * @param {boolean} isOpen - Whether the mobile studio should be revealed.
	 * @returns {void}
	 */
	setMobileState(isOpen) {
		this.dom.studioPanel.classList.toggle("is-open", isOpen);
		this.dom.studioPanel.inert = !isOpen;
		this.dom.studioPanel.setAttribute("aria-hidden", String(!isOpen));
		this.dom.studioBackdrop.hidden = !isOpen;
		this.dom.studioToggle.setAttribute("aria-expanded", String(isOpen));
	}

	/**
	 * Restores the permanently visible desktop studio semantics.
	 *
	 * @returns {void}
	 */
	setDesktopState() {
		this.dom.studioPanel.classList.remove("is-open");
		this.dom.studioPanel.inert = false;
		this.dom.studioPanel.setAttribute("aria-hidden", "false");
		this.dom.studioBackdrop.hidden = true;
		this.dom.studioToggle.setAttribute("aria-expanded", "true");
	}
}
