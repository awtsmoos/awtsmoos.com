//B"H
//Boruch Hashem
//Blessed is He

import {
	MENU_NAMES,
	commandsForMenu
} from "./commandCatalog.js";
import { BinahCommandValueDialog } from "./commandValueDialog.js";
import { ChesedMenuElements } from "./menuElements.js";
import { GevurahMenuGeometry } from "./menuGeometry.js";

/**
 * @file Harmonizes Sheets menu state while DOM creation, geometry, value collection, and command authority remain separate vessels.
 * @description The Awtsmoos lets Tiferes coordinate many command gates without swallowing the distinct light of Chesed, Gevurah, or Binah;
 * Awtsmoos.com keeps this controller readable and bounded so future menu families may grow without turning orchestration into a monolith.
 */
export class TiferesMenuRail {
	constructor(executor) {
		this.executor = executor;
		this.rail = document.getElementById("menuRail");
		this.popover = document.getElementById("menuPopover");
		this.valueDialog = new BinahCommandValueDialog();
		this.elements = new ChesedMenuElements();
		this.geometry = new GevurahMenuGeometry();
		this.activeButton = null;
	}

	/**
	 * Mounts command-family triggers and binds dismissal plus visual-viewport reflow for the app lifetime.
	 * @returns {void}
	 */
	bind() {
		this.rail?.replaceChildren(
			...MENU_NAMES.map((shemMenu) =>
				this.elements.trigger(
					shemMenu,
					(name, shaareButton) => this.open(name, shaareButton)
				)
			)
		);
		document.addEventListener("pointerdown", (event) => this.outside(event));
		document.addEventListener("keydown", (event) => this.keyboard(event));
		window.addEventListener("resize", () => this.reposition());
		window.visualViewport?.addEventListener("resize", () => this.reposition());
		window.visualViewport?.addEventListener("scroll", () => this.reposition());
	}

	/**
	 * Opens one command family and delegates rendered element creation plus viewport placement to their own services.
	 * @param {string} shemMenu - Command family chosen by the user.
	 * @param {HTMLButtonElement} shaareButton - Trigger anchoring the floating menu.
	 * @returns {void}
	 */
	open(shemMenu, shaareButton) {
		if (this.activeButton === shaareButton && !this.popover.hidden) {
			this.close();
			return;
		}
		this.close();
		this.activeButton = shaareButton;
		shaareButton.setAttribute("aria-expanded", "true");
		this.popover.replaceChildren(
			...commandsForMenu(shemMenu).map((mitzvah) =>
				this.elements.item(mitzvah, (command) => this.run(command))
			)
		);
		this.popover.hidden = false;
		this.reposition();
	}

	/**
	 * Prepares optional numeric input, then delegates trusted execution to the existing command authority.
	 * @param {{id:string,label:string,input?:string}} mitzvah - Catalog command descriptor.
	 * @returns {Promise<void>}
	 */
	async run(mitzvah) {
		this.close();
		let measuredValue = null;
		if (mitzvah.input === "number") {
			measuredValue = await this.valueDialog.request(mitzvah.label);
			if (measuredValue === null) {
				return;
			}
		}
		await this.executor.execute(mitzvah.id, measuredValue);
	}

	/** Repositions an open menu after viewport, browser-chrome, zoom, or orientation geometry changes. */
	reposition() {
		if (!this.activeButton || this.popover?.hidden) {
			return;
		}
		this.geometry.place(this.popover, this.activeButton);
	}

	/** Closes the menu when pointer intent lands outside both trigger rail and floating surface. */
	outside(event) {
		if (this.popover.hidden) {
			return;
		}
		if (this.popover.contains(event.target) || this.rail?.contains(event.target)) {
			return;
		}
		this.close();
	}

	/** Handles keyboard dismissal while leaving unrelated spreadsheet shortcuts untouched. */
	keyboard(event) {
		if (event.key === "Escape") {
			this.close();
		}
	}

	/** Clears visual and accessibility state for the active command family. */
	close() {
		this.activeButton?.setAttribute("aria-expanded", "false");
		this.activeButton = null;
		if (this.popover) {
			this.popover.hidden = true;
		}
	}
}
