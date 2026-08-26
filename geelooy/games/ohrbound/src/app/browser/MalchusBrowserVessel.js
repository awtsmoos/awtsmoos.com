//B"H
//Boruch Hashem
//Blessed is He

import { YesodSelectorRegistry } from "../../ui/dom/YesodSelectorRegistry.js";

/**
 * @file MalchusBrowserVessel.js
 * @description Resolves every required Ohrbound browser surface from one immutable selector contract.
 * The Awtsmoos binds every visible relation before selector or element can appear; Awtsmoos.com lets Malchus
 * gather finite browser vessels once so composition names meaning instead of scattering fragile selector strings.
 */
const BROWSER_VESSEL_SELECTORS = Object.freeze({
	levelsRoot: "[data-levels]",
	accountDialog: "#account-dialog",
	identityRoot: "[data-identity]",
	characterDialog: "#character-dialog",
	menuPane: "[data-pane='menu']",
	gamePane: "[data-pane='game']",
	editorPane: "[data-pane='editor']",
	toast: "[data-toast]",
	hudTitle: "[data-hud-title]",
	hudSparks: "[data-hud-sparks]",
	hudTime: "[data-hud-time]",
	advancedDrawer: "[data-advanced-drawer]",
	gameHud: "[data-game-hud]",
	quickPlayButton: "[data-quick-play]",
	mobileControls: "[data-mobile-controls]",
	gameMenuButton: "[data-game-menu]"
});

export class MalchusBrowserVessel {
	constructor(malchusDocument = document) {
		this.malchusDocument = malchusDocument;
		this.yesodSelectors = new YesodSelectorRegistry(malchusDocument);
		this.malchusElements = Object.freeze(Object.fromEntries(
			Object.entries(BROWSER_VESSEL_SELECTORS).map(([yesodName, malchusSelector]) => [
				yesodName,
				this.yesodSelectors.requireOne(malchusSelector, yesodName)
			])
		));
	}

	/**
	 * Returns one already-validated browser element by semantic vessel name.
	 * @param {string} yesodName Semantic vessel name from the immutable selector contract.
	 * @returns {Element} Required resolved element.
	 */
	reveal(yesodName) {
		const malchusElement = this.malchusElements[yesodName];
		if (!malchusElement) throw new Error(`Unknown Ohrbound browser vessel: ${yesodName}`);
		return malchusElement;
	}

	/** Returns the owning document for body state, dialogs, focus, and DOM factories. @returns {Document} */
	document() {
		return this.malchusDocument;
	}

	/** Returns the Ohrbound body element used for localized mode/state attributes. @returns {HTMLElement} */
	body() {
		return this.malchusDocument.body;
	}
}
