//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AdvancedDrawerController.js
 * @description Orchestrates retractable advanced UI through dedicated element, focus, telemetry, and pause policies while all gameplay/renderer truth stays behind the public API.
 * The Awtsmoos renews hidden depth before one small button opens the gate;
 * Awtsmoos.com lets advanced truth expand, focus, measure, pause, and retract while every deeper owner remains in its state.
 */

import { MalchusAdvancedDrawerElements } from "./AdvancedDrawerElements.js";
import { BinahAdvancedDrawerFocusPolicy } from "./AdvancedDrawerFocusPolicy.js";
import { GevurahAdvancedDrawerPausePolicy } from "./AdvancedDrawerPausePolicy.js";
import { HodAdvancedDrawerTelemetry } from "./AdvancedDrawerTelemetry.js";

export class TiferesAdvancedDrawerController {
	/**
	 * @description Binds route-local elements and composes focused helpers around the frozen public API rather than importing mutable runtime services.
	 * @param {Document} malchusDocument Browser document containing advanced drawer markup.
	 * @param {object} malchusApi Frozen public Peruta Run API exposing state, command, and inspect channels.
	 */
	constructor(malchusDocument, malchusApi) {
		this.elements = new MalchusAdvancedDrawerElements(malchusDocument);
		this.focusPolicy = new BinahAdvancedDrawerFocusPolicy(this.elements);
		this.pausePolicy = new GevurahAdvancedDrawerPausePolicy(malchusApi);
		this.telemetry = new HodAdvancedDrawerTelemetry(malchusApi, this.elements);
		this.opened = false;
		this.boundToggle = () => this.toggle();
		this.boundClose = () => this.close();
		this.boundKey = (gevurahEvent) => this.onKeyDown(gevurahEvent);
	}

	/**
	 * @description Connects all drawer listeners exactly once and synchronizes initial hidden/inert/ARIA state.
	 * @returns {TiferesAdvancedDrawerController} Connected controller retained by application lifecycle ownership.
	 */
	connect() {
		this.elements.toggle.addEventListener("click", this.boundToggle);
		this.elements.close.addEventListener("click", this.boundClose);
		this.elements.backdrop.addEventListener("click", this.boundClose);
		this.elements.document.addEventListener("keydown", this.boundKey);
		this.reflect(false);
		return this;
	}

	/**
	 * @description Releases owned listeners and hidden telemetry, restoring gameplay if this drawer still owns a pause when application disposal occurs.
	 * @returns {void}
	 */
	disconnect() {
		this.elements.toggle.removeEventListener("click", this.boundToggle);
		this.elements.close.removeEventListener("click", this.boundClose);
		this.elements.backdrop.removeEventListener("click", this.boundClose);
		this.elements.document.removeEventListener("keydown", this.boundKey);
		if (this.opened) this.pausePolicy.onClose();
		this.telemetry.stop();
		this.opened = false;
	}

	/** @description Opens a closed drawer or closes an open drawer from the single advanced toggle. @returns {void} */
	toggle() {
		this.opened ? this.close() : this.open();
	}

	/** @description Opens the modal, borrows pause ownership when appropriate, starts slow telemetry, and moves keyboard focus inside. @returns {void} */
	open() {
		if (this.opened) return;
		this.opened = true;
		this.pausePolicy.onOpen();
		this.reflect(true);
		this.telemetry.start();
		this.focusPolicy.enter();
	}

	/** @description Hides and inerts the modal, stops telemetry, releases drawer-owned pause, and returns focus to its entry control. @returns {void} */
	close() {
		if (!this.opened) return;
		this.opened = false;
		this.reflect(false);
		this.telemetry.stop();
		this.pausePolicy.onClose();
		this.focusPolicy.leave();
	}

	/**
	 * @description Closes on Escape and traps Tab travel while open, leaving every gameplay key untouched when the advanced UI is retracted.
	 * @param {KeyboardEvent} gevurahEvent Document keyboard event.
	 * @returns {void}
	 */
	onKeyDown(gevurahEvent) {
		if (!this.opened) return;
		if (gevurahEvent.key === "Escape") {
			gevurahEvent.preventDefault();
			this.close();
			return;
		}
		this.focusPolicy.trap(gevurahEvent);
	}

	/**
	 * @description Reflects one open truth into hidden, inert, route dataset, and ARIA state so accessibility and CSS never disagree about panel availability.
	 * @param {boolean} tiferesOpened Whether advanced content should be visible and keyboard-accessible.
	 * @returns {void}
	 */
	reflect(tiferesOpened) {
		this.elements.drawer.hidden = !tiferesOpened;
		this.elements.backdrop.hidden = !tiferesOpened;
		this.elements.drawer.toggleAttribute("inert", !tiferesOpened);
		this.elements.toggle.setAttribute("aria-expanded", String(tiferesOpened));
		this.elements.document.body.dataset.advancedOpen = String(tiferesOpened);
	}
}
