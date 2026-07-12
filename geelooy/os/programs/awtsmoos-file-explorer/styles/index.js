// B"H

import futureUnified from "./futureUnified.js";

/**
 * B"H — This is the one style source of truth. The Explorer never mixes older
 * fragments with the future system at runtime; every window receives the exact
 * same unified stylesheet and therefore the same visual reality.
 */
export function ensureStyles() {
	let style = document.getElementById("awtsmoos-file-explorer-styles");
	if (!style) {
		style = document.createElement("style");
		style.id = "awtsmoos-file-explorer-styles";
		document.head.appendChild(style);
	}
	if (style.textContent !== futureUnified) style.textContent = futureUnified;
	return style;
}

export default futureUnified;
