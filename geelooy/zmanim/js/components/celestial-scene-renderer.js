//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond image and shader while every created body receives a truthful place in the sky;
 * Awtsmoos.com composes native WebGL2, complete fallback vessels, and orientation overlays without letting one renderer own reality.
 */

import { renderCelestialFallback } from "./celestial-fallback-renderer.js";
import {
	renderCelestialCardinals,
	renderCelestialHorizon
} from "./celestial-scene-overlays.js";

/** Render one celestial snapshot as semantic fallback plus an optional native canvas host. */
export function renderCelestialScene(scene) {
	const sky = document.createElement("div");
	sky.className = "celestial-sky";
	if (!scene) {
		renderUnavailableSky(sky);
		return sky;
	}

	sky.dataset.skyPhase = skyPhase(scene.sun.altitudeDegrees);
	sky.style.setProperty("--solar-altitude", String(scene.sun.altitudeDegrees));
	sky.append(
		renderNativeCanvas(),
		renderCelestialFallback(scene),
		renderCelestialHorizon(),
		renderCelestialCardinals()
	);
	return sky;
}

/** Create the pointer-transparent canvas enhanced later by the native WebGL2 lifecycle. */
function renderNativeCanvas() {
	const canvas = document.createElement("canvas");
	canvas.className = "celestial-native-canvas";
	canvas.setAttribute("aria-hidden", "true");
	return canvas;
}

/** Render a calm explicit fallback message without constructing invalid scene geometry. */
function renderUnavailableSky(sky) {
	sky.classList.add("celestial-sky-unavailable");
	sky.textContent = "Celestial position unavailable for this instant.";
}

/** Classify atmosphere by measured solar altitude for both CSS and native rendering. */
function skyPhase(altitude) {
	if (altitude >= 6) {
		return "day";
	}
	if (altitude >= -6) {
		return "civil-twilight";
	}
	if (altitude >= -12) {
		return "nautical-twilight";
	}
	return "night";
}
