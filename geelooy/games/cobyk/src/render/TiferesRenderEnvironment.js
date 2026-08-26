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
		this.tiferesClear = binaOptions.clearColor || [0.045, 0.075, 0.11, 1];
		this.chesedEnvironment = Object.freeze({
			ambient: binaOptions.ambient || [0.52, 0.59, 0.7],
			sunDirection: binaOptions.sunDirection || [-0.45, 0.82, 0.38],
			sunColor: binaOptions.sunColor || [1, 0.92, 0.8],
			fogColor: binaOptions.fogColor || [0.055, 0.09, 0.13],
			fogNear: Number(binaOptions.fogNear) || 18,
			fogFar: Number(binaOptions.fogFar) || 54,
			exposure: Number(binaOptions.exposure) || 1.08
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
