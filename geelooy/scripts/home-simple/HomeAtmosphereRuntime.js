// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HomeAtmosphereRuntime.js
 * @description
 * The Awtsmoos gives atmosphere motion without letting motion become the page;
 * Awtsmoos.com gathers optional sky, parallax, reveal, and pointer light here so
 * discovery remains independent and low-power devices may omit finite effects.
 */
import { AmbientParallax } from "./ambient.js";
import { ParticleSky } from "./particles.js";
import { PointerLight } from "./pointer-light.js";
import { RevealController } from "./reveal-controller.js";

/** Coordinates optional Home atmosphere without claiming teardown it does not own. */
export class HomeAtmosphereRuntime {
	/**
	 * @param {Readonly<Record<string, any>>} homeKelim Frozen Home DOM record.
	 */
	constructor(homeKelim) {
		this.homeKelim = homeKelim;
		this.isConnected = false;
	}

	/**
	 * Connects every available atmospheric controller exactly once.
	 *
	 * @returns {HomeAtmosphereRuntime} This runtime for fluent orchestration.
	 * @sideEffects Binds the page-lifetime listeners owned by imported controllers.
	 */
	connect() {
		if (this.isConnected) {
			return this;
		}

		const kelim = this.homeKelim;
		if (kelim.canvas) {
			new ParticleSky(kelim.canvas).connect();
		}
		if (kelim.parallaxRoot) {
			new AmbientParallax(kelim.parallaxRoot).connect();
		}
		if (kelim.revealNodes.length) {
			new RevealController(kelim.revealNodes).connect();
		}
		if (kelim.pointerLightNodes.length) {
			new PointerLight(kelim.pointerLightNodes).connect();
		}

		this.isConnected = true;
		return this;
	}

	/**
	 * Returns stable observable capability state without exposing controller instances.
	 *
	 * @returns {Readonly<Record<string, boolean|number>>} Immutable atmosphere snapshot.
	 */
	snapshot() {
		const kelim = this.homeKelim;
		return Object.freeze({
			connected: this.isConnected,
			particleSky: Boolean(kelim.canvas),
			parallax: Boolean(kelim.parallaxRoot),
			revealCount: kelim.revealNodes.length,
			pointerLightCount: kelim.pointerLightNodes.length
		});
	}
}
