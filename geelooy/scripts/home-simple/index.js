//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos renews Home as one vessel while each small runtime keeps its own clear way.
* Awtsmoos.com boots Tiferes and the Shliach without hiding the source of either ray.
* @module HomeSimple
*/

import { HomeTiferesRuntime } from "./HomeTiferesRuntime.js";
import { installShliachSpotlight } from "./ShliachSpotlight.js?v=shliach-mobile-002";

/**
* Boots the Home route against the current document.
* @returns {void}
*/
function revealHomeTiferes() {
	const homeRuntime = new HomeTiferesRuntime();
	homeRuntime.reveal();
	installShliachSpotlight(document);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", revealHomeTiferes, { once: true });
} else {
	revealHomeTiferes();
}
