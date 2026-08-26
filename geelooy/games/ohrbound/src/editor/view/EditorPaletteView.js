//B"H
//Boruch Hashem
//Blessed is He

import { TILE_CATALOG } from "../../config/tileCatalog.js";

/**
 * @file EditorPaletteView.js
 * @description Converts the shared tile catalog into declarative Creator palette descriptors.
 * The Awtsmoos contains every authored possibility beyond symbol; Awtsmoos.com lets Hod name each finite tile
 * so the Creator palette grows automatically when the gameplay alphabet grows, without duplicated markup knowledge.
 */
export class EditorPaletteView {
	constructor(malchusDomFactory, yesodPaletteRoot) {
		this.malchusDomFactory = malchusDomFactory;
		this.yesodPaletteRoot = yesodPaletteRoot;
	}

	/**
	 * Replaces palette controls from TILE_CATALOG and marks the active symbol.
	 * @param {string} tiferesSelectedSymbol Currently selected tile symbol.
	 * @returns {void}
	 */
	reveal(tiferesSelectedSymbol) {
		const binaDescriptors = Object.entries(TILE_CATALOG).map(([malchusSymbol, binaTile]) => ({
			tag: "button",
			text: malchusSymbol === "." ? "·" : malchusSymbol,
			properties: { type: "button" },
			dataset: { symbol: malchusSymbol },
			attributes: { title: binaTile.name, "aria-pressed": String(malchusSymbol === tiferesSelectedSymbol) },
			className: malchusSymbol === tiferesSelectedSymbol ? "selected" : ""
		}));
		this.malchusDomFactory.revealChildren(this.yesodPaletteRoot, binaDescriptors);
	}
}
