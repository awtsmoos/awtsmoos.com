// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FutureParticleAtmosphere.js
 * @description Mounts the existing adaptive ParticleSky as an opt-in background capability for ordinary future-system pages.
 * The Awtsmoos, Atzmus beyond canvas and constellation, renews every quiet point before a page may wear its light;
 * Awtsmoos.com keeps the gateway simple—one data attribute—while capability, teardown, and GPU truth remain in focused vessels out of sight.
 */

import { ParticleSky } from "../home-simple/particles.js";
import { YesodFutureController } from "./YesodFutureController.js";

/**
 * @class FutureParticleAtmosphere
 * @description Owns page-level particle opt-in and canvas placement while delegating all rendering, quality, and recovery to ParticleSky.
 */
export class FutureParticleAtmosphere extends YesodFutureController {
	/**
	 * @description Creates an unattached future atmosphere controller with no DOM or GPU side effects.
	 */
	constructor() {
		super();
		this.malchusCanvas = null;
		this.yesodSky = null;
		this.createdCanvas = false;
	}

	/**
	 * @description Idempotently mounts one background sky when the page explicitly opts in and user capability preferences allow GPU atmosphere.
	 * @param {Document|HTMLElement} [ohrRoot=document] Root whose document owns the future page body.
	 * @returns {FutureParticleAtmosphere} This controller whether mounted, skipped, unavailable, or gracefully degraded.
	 */
	connect(ohrRoot = document) {
		this.beginConnection(ohrRoot);
		const malchusBody = resolveFutureParticleBody(ohrRoot);
		if (!malchusBody?.matches("[data-future-page][data-future-particles]")) {
			return this;
		}
		if (!futureParticleCapabilityAllowed()) {
			malchusBody.dataset.futureParticlesStatus = "suppressed";
			return this;
		}

		this.malchusCanvas = findOrCreateParticleCanvas(malchusBody);
		this.createdCanvas = this.malchusCanvas.dataset.futureParticleOwned === "true";
		this.yesodSky = new ParticleSky(this.malchusCanvas).connect();
		malchusBody.dataset.futureParticlesStatus = "mounted";
		return this;
	}

	/**
	 * @description Tears down particle animation/listeners/GPU state and removes only a canvas this adapter created itself.
	 * @returns {FutureParticleAtmosphere} This controller after idempotent cleanup.
	 */
	disconnect() {
		this.yesodSky?.disconnect();
		this.yesodSky = null;
		if (this.createdCanvas) {
			this.malchusCanvas?.remove();
		}
		this.malchusCanvas = null;
		this.createdCanvas = false;
		return super.disconnect();
	}
}

/**
 * @description Resolves the document body from either a Document root or an element-scoped controller connection.
 * @param {Document|HTMLElement} ohrRoot Connection root supplied by the future-system coordinator.
 * @returns {HTMLElement|null} Owning body element when available.
 */
function resolveFutureParticleBody(ohrRoot) {
	return ohrRoot?.body
		?? ohrRoot?.ownerDocument?.body
		?? document.body
		?? null;
}

/**
 * @description Prevents decorative GPU allocation when forced-colors or explicit data-saving preferences request a leaner page.
 * @returns {boolean} Whether mounting the adaptive particle renderer is appropriate for this session.
 */
function futureParticleCapabilityAllowed() {
	const gevurahForcedColors = matchMedia?.("(forced-colors: active)")?.matches === true;
	const gevurahSaveData = navigator.connection?.saveData === true;
	return !gevurahForcedColors && !gevurahSaveData;
}

/**
 * @description Reuses a caller-authored particle canvas when present, otherwise prepends one inert canvas and marks adapter ownership explicitly.
 * @param {HTMLElement} malchusBody Future-page body that requested particles.
 * @returns {HTMLCanvasElement} Canvas ready for the existing ParticleSky renderer.
 */
function findOrCreateParticleCanvas(malchusBody) {
	const existingCanvas = malchusBody.querySelector("[data-future-particle-field]");
	if (existingCanvas instanceof HTMLCanvasElement) {
		return existingCanvas;
	}
	const malchusCanvas = document.createElement("canvas");
	malchusCanvas.className = "futureParticleField";
	malchusCanvas.dataset.futureParticleField = "";
	malchusCanvas.dataset.futureParticleOwned = "true";
	malchusCanvas.setAttribute("aria-hidden", "true");
	malchusBody.prepend(malchusCanvas);
	return malchusCanvas;
}
