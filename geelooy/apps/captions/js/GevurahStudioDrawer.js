// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahStudioDrawer.js
 * @description
 * The Awtsmoos gives concealment a truthful boundary instead of an off-screen illusion;
 * Awtsmoos.com guides gesture and viewport while a dedicated vessel guards semantic inclusion.
 */
import { GevurahStudioAccessibility } from "./GevurahStudioAccessibility.js";

export class GevurahStudioDrawer {
	/**
	 * Creates the responsive studio boundary.
	 *
	 * @param {Record<string, HTMLElement>} dom - Collected Ein Sof interface vessels.
	 */
	constructor(dom) {
		this.dom = dom;
		this.mobileQuery = window.matchMedia("(max-width: 760px)");
		this.accessibility = new GevurahStudioAccessibility(dom);
	}

	/**
	 * Connects drawer gestures and synchronizes the initial viewport state.
	 *
	 * @returns {GevurahStudioDrawer} Connected drawer runtime.
	 */
	connect() {
		this.dom.studioToggle.addEventListener("click", () => this.toggle());
		this.dom.studioClose.addEventListener("click", () => this.closeMobile(true));
		this.dom.studioBackdrop.addEventListener("click", () => this.closeMobile(true));
		this.mobileQuery.addEventListener("change", () => this.syncViewport());
		document.addEventListener("keydown", event => this.handleKeydown(event));
		this.syncViewport();
		return this;
	}

	/**
	 * Toggles the correct desktop or mobile studio manifestation.
	 *
	 * @returns {void}
	 */
	toggle() {
		if (this.mobileQuery.matches) {
			this.isMobileOpen() ? this.closeMobile(false) : this.openMobile();
			return;
		}

		const retracted = this.dom.einSofShell.classList.toggle("studio-retracted");
		this.dom.studioToggle.setAttribute("aria-expanded", String(!retracted));
		this.dom.studioToggle.textContent = retracted ? "Open" : "Controls";
	}

	/**
	 * Reveals the mobile studio before moving keyboard focus into it.
	 *
	 * @returns {void}
	 */
	openMobile() {
		this.accessibility.setMobileState(true);
		this.dom.studioClose.focus();
	}

	/**
	 * Conceals the mobile studio and optionally returns focus to its trigger.
	 *
	 * @param {boolean} restoreFocus - Whether focus should return to the studio toggle.
	 * @returns {void}
	 */
	closeMobile(restoreFocus = false) {
		this.accessibility.setMobileState(false);
		if (restoreFocus) {
			this.dom.studioToggle.focus();
		}
	}

	/**
	 * Reconciles semantic state when the viewport crosses the mobile boundary.
	 *
	 * @returns {void}
	 */
	syncViewport() {
		this.dom.einSofShell.classList.remove("studio-retracted");
		this.dom.studioToggle.textContent = "Controls";
		if (this.mobileQuery.matches) {
			this.closeMobile(false);
			return;
		}
		this.accessibility.setDesktopState();
	}

	/**
	 * Closes an open mobile studio when Escape is pressed.
	 *
	 * @param {KeyboardEvent} event - Document keyboard event.
	 * @returns {void}
	 */
	handleKeydown(event) {
		if (event.key === "Escape" && this.mobileQuery.matches && this.isMobileOpen()) {
			this.closeMobile(true);
		}
	}

	/**
	 * Reports whether the mobile drawer is currently revealed.
	 *
	 * @returns {boolean} True when the open class is present.
	 */
	isMobileOpen() {
		return this.dom.studioPanel.classList.contains("is-open");
	}
}
