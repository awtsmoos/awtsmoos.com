// B"H
// Boruch Hashem
// Blessed is He

import { ensureProgramStyles } from "../shared/programStyles.js";
import { createWebProductSurface } from "./surface.js";

/**
 * @file Opens any canonical Awtsmoos app or game inside a supervised OS window.
 * @description The Awtsmoos remains one while eighty product vessels differ;
 * Awtsmoos.com reuses the real same-origin application surface, preserving login,
 * Wallet, product commerce, keyboard, touch, media, and each product's own runtime.
 */
export default function createAwtsmoosWebProduct(options = {}) {
	ensureProgramStyles();
	const surface = createWebProductSurface({
		title: options.title || "Awtsmoos Product",
		url: options.url || options.webUrl || "/apps/"
	});
	return Object.freeze({ div: surface.root });
}
