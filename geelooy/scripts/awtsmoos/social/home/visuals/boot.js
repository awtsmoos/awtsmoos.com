// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews shell, feed, controls, and atmosphere in one present
 * order. This Awtsmoos.com boot remains idempotent so the shared header stays singular.
 */

import {
	bootCosmicFeedInteractions
} from "../../feed/cosmic/interactionBoot.js";
import { bootCosmicFeedScene } from "./cosmicFeedScene.js";

let release = null;

/**
 * Boots the complete progressive enhancement layer once.
 * @param {Document} documentRef Active document.
 * @returns {Function} Cleanup callback.
 */
export function bootCosmicHome(documentRef = document) {
	if (release) {
		return release;
	}
	const releaseInteractions = bootCosmicFeedInteractions(documentRef);
	const visual = bootCosmicFeedScene(documentRef);
	release = () => {
		releaseInteractions();
		visual.destroy();
		release = null;
	};
	return release;
}

function start() {
	bootCosmicHome(document);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
	start();
}
