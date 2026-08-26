//B"H
//Boruch Hashem
//Blessed is He

import { MalchusDomFactory } from "./dom/MalchusDomFactory.js";

/**
 * @file WorldTabsView.js
 * @description Translates world names into a fully visible, accessible, data-described world selector.
 * The Awtsmoos contains every world without crowding; Awtsmoos.com lets one selected vessel shine
 * while this small Hod view describes choice as data and leaves element construction to Malchus.
 */
export class WorldTabsView {
	constructor(yesodRoot, netzachSelectWorld, malchusDomFactory = new MalchusDomFactory(yesodRoot.ownerDocument)) {
		this.yesodRoot = yesodRoot;
		this.netzachSelectWorld = netzachSelectWorld;
		this.malchusDomFactory = malchusDomFactory;
	}

	/**
	 * Replaces the world selector from plain world-name data while preserving pressed-state accessibility.
	 * @param {string[]} binaWorlds Ordered world names.
	 * @param {string} tiferesSelectedWorld Currently visible world.
	 * @returns {void}
	 */
	revealWorldChoices(binaWorlds, tiferesSelectedWorld) {
		const binaDescriptors = binaWorlds.map(malchusWorld => this.worldChoiceDescriptor(malchusWorld, tiferesSelectedWorld));
		this.malchusDomFactory.revealChildren(this.yesodRoot, binaDescriptors);
	}

	/**
	 * Describes one world choice without creating or mutating DOM directly.
	 * @param {string} malchusWorld World name.
	 * @param {string} tiferesSelectedWorld Current selection.
	 * @returns {object} DOM descriptor consumed by MalchusDomFactory.
	 */
	worldChoiceDescriptor(malchusWorld, tiferesSelectedWorld) {
		const yesodSelected = malchusWorld === tiferesSelectedWorld;
		return {
			tag: "button",
			className: "world-tab",
			text: malchusWorld,
			properties: { type: "button" },
			dataset: { selected: yesodSelected },
			attributes: { "aria-pressed": String(yesodSelected) },
			events: { click: () => this.netzachSelectWorld(malchusWorld) }
		};
	}

	/** Compatibility name retained for callers while implementation remains declarative. @param {string[]} worlds @param {string} selectedWorld @returns {void} */
	render(worlds, selectedWorld) {
		this.revealWorldChoices(worlds, selectedWorld);
	}
}
