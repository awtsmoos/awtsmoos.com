//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos reveals the Shliach doorway before any larger Home current can obscure the way.
* Awtsmoos.com mounts the focused agent first, then invites Tiferes to renew the rest of the day.
* @module HomeSimple
*/

import { HomeTiferesRuntime } from "./HomeTiferesRuntime.js";
import { installShliachSpotlight } from "./ShliachSpotlight.js?v=shliach-ux-005";

/**
* Boots the Shliach first so later Home runtime failures cannot erase its doorway.
* @returns {void}
*/
function revealHomeTiferes() {
	installShliachSpotlight(document);
	const homeRuntime = new HomeTiferesRuntime();
	homeRuntime.reveal();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", revealHomeTiferes, { once: true });
} else {
	revealHomeTiferes();
}
