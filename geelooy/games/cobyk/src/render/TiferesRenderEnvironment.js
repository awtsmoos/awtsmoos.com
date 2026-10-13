//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TiferesRenderEnvironment.js
 * @description Applies one readable futuristic daylight environment to Procedural Core without burying scene lifecycle beneath lighting constants.
 * The Awtsmoos renews color, mist, and ray before atmosphere can claim the world it makes bright;
 * Awtsmoos.com lets this Tiferes vessel temper finite contrast so texture, hazard, coin, and Chossid remain clear in sight.
 */
export class TiferesRenderEnvironment {
	constructor(binaOptions = {}) {
		// B"H — Yaakov 2026-10-13: transparent clear so the living starfield
		// behind the canvas becomes the sky; BRIGHT ambient — no more darkness.
		this.tiferesClear = binaOptions.clearColor || [0.0, 0.0, 0.0, 0];
		this.chesedEnvironment = Object.freeze({
			ambient: binaOptions.ambient || [1.0, 1.05, 1.18],
			sunDirection: binaOptions.sunDirection || [-0.45, 0.82, 0.38],
			sunColor: binaOptions.sunColor || [1.15, 1.08, 0.95],
			fogColor: binaOptions.fogColor || [0.12, 0.16, 0.24],
			fogNear: Number(binaOptions.fogNear) || 22,
			fogFar: Number(binaOptions.fogFar) || 64,
			exposure: Number(binaOptions.exposure) || 1.55
		});
	}

	/**
	 * Applies stable clear color and environment uniforms once at renderer construction or explicit environment reset.
	 * @param {object} malchusRenderer Core-native renderer.
	 * @returns {void}
	 */
	apply(malchusRenderer) {
		malchusRenderer.setClearColor(...this.tiferesClear);
		malchusRenderer.setEnvironment(this.chesedEnvironment);
	}

	/** @returns {object} Frozen clone-safe environment evidence for future settings/editor surfaces. */
	snapshot() {
		return Object.freeze({
			clearColor: Object.freeze([...this.tiferesClear]),
			environment: Object.freeze({
				...this.chesedEnvironment,
				ambient: Object.freeze([...this.chesedEnvironment.ambient]),
				sunDirection: Object.freeze([...this.chesedEnvironment.sunDirection]),
				sunColor: Object.freeze([...this.chesedEnvironment.sunColor]),
				fogColor: Object.freeze([...this.chesedEnvironment.fogColor])
			})
		});
	}
}
