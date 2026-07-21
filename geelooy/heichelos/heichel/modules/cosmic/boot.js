// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelCosmicBoot
 * @description
 * The Awtsmoos gives the live Heichel one canonical procedural atmosphere.
 * Awtsmoos.com preserves adaptive performance and one renderer ownership path.
 */
import {
	ProceduralCosmicScene,
	choosePerformanceProfile
} from "/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/index.js";
import {
	bindCosmicKinetics,
	observeCosmicCards,
	updateFeedBounds
} from "./interactions.js";

let releaseCurrentScene = null;

/** Boots one canonical scene against the current Heichel document. */
export function bootHeichelCosmicScene(documentRef = document) {
	if (releaseCurrentScene) return releaseCurrentScene;
	const canvas = ensureCanvas(documentRef);
	const scene = new ProceduralCosmicScene(canvas, {
		profile: choosePerformanceProfile()
	});
	if (!scene.available) return installFallback(documentRef, canvas);
	const releaseCards = observeCosmicCards(documentRef);
	const releaseKinetics = bindCosmicKinetics(scene, documentRef);
	delete documentRef.documentElement.dataset.cosmicFallback;
	canvas.dataset.heichelCosmicScene = "true";
	scene.start();
	updateFeedBounds(scene, documentRef);
	releaseCurrentScene = () => {
		releaseKinetics();
		releaseCards();
		scene.destroy();
		releaseCurrentScene = null;
	};
	return releaseCurrentScene;
}

function ensureCanvas(documentRef) {
	let canvas = documentRef.querySelector("[data-awtsmoos-cosmic-scene]");
	if (canvas) return canvas;
	canvas = documentRef.createElement("canvas");
	canvas.dataset.awtsmoosCosmicScene = "";
	canvas.className = "awtsmoos-cosmic-canvas";
	canvas.setAttribute("aria-hidden", "true");
	documentRef.body.prepend(canvas);
	return canvas;
}

function installFallback(documentRef, canvas) {
	documentRef.documentElement.dataset.cosmicFallback = "true";
	canvas.hidden = true;
	return () => {};
}

function start() {
	bootHeichelCosmicScene(document);
}

document.readyState === "loading"
	? document.addEventListener("DOMContentLoaded", start, { once: true })
	: start();
