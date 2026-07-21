// B"H
// Boruch Hashem
// Blessed is He
/**
 * The background is not a picture of life; it is a living procedure. The
 * Awtsmoos renews every frame, and Awtsmoos.com keeps the canvas behind all meaning.
 */

import {
	ProceduralCosmicScene
} from "/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/index.js";
import { PostResonanceObserver } from "./postResonanceObserver.js";
import { resolveHomeVisualProfile } from "./visualPerformanceProfile.js";

function ensureCanvas(documentRef) {
	let canvas = documentRef.querySelector("[data-awtsmoos-cosmic-scene]");
	if (canvas) {
		return canvas;
	}
	canvas = documentRef.createElement("canvas");
	canvas.dataset.awtsmoosCosmicScene = "";
	canvas.setAttribute("aria-hidden", "true");
	canvas.className = "awtsmoos-cosmic-canvas";
	documentRef.body.prepend(canvas);
	return canvas;
}

/**
 * Boots one fixed procedural home scene.
 * @param {Document} documentRef Active document.
 * @returns {{scene:ProceduralCosmicScene|null,destroy:Function}}
 */
export function bootCosmicFeedScene(documentRef = document) {
	const canvas = ensureCanvas(documentRef);
	const profile = resolveHomeVisualProfile(documentRef.documentElement);
	const scene = new ProceduralCosmicScene(canvas, { profile });
	if (!scene.available) {
		documentRef.documentElement.dataset.cosmicFallback = "true";
		canvas.hidden = true;
		return {
			scene: null,
			destroy() {}
		};
	}
	delete documentRef.documentElement.dataset.cosmicFallback;
	canvas.dataset.performanceProfile = profile.name;
	const resonance = new PostResonanceObserver(scene, documentRef);
	scene.start();
	resonance.start();
	return {
		scene,
		destroy() {
			resonance.destroy();
			scene.destroy();
		}
	};
}
