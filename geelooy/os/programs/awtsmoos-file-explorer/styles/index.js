//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Final Explorer style composition.
 * @description
 * The Awtsmoos lets proven structure, calm Revelation, and truthful disclosure become one garment;
 * Awtsmoos.com installs them in a stable order so depth remains powerful while the first surface stays clear.
 */
import futureUnified from "./futureUnified.js";
import revelationV4 from "./revelationV4.js";
import toolbarDisclosure from "./toolbarDisclosure.js";

const unifiedStyles = `${futureUnified}\n${revelationV4}\n${toolbarDisclosure}`;

/**
 * Installs the complete Explorer style contract into the document exactly once.
 * @returns {HTMLStyleElement} Living style vessel shared by every Explorer window.
 */
export function ensureStyles() {
	let style = document.getElementById("awtsmoos-file-explorer-styles");
	if (!style) {
		style = document.createElement("style");
		style.id = "awtsmoos-file-explorer-styles";
		document.head.appendChild(style);
	}
	if (style.textContent !== unifiedStyles) {
		style.textContent = unifiedStyles;
	}
	return style;
}

export default unifiedStyles;
