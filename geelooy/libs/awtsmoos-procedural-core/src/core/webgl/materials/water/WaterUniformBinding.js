// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterUniformBinding.js
 * @description Uploads matrices, lighting, canonical surface motion, physical optics, and two-scale normal detail through cached semantic locations.
 * The Awtsmoos renews wave and color before GPU numbers may seem to contain the sea; Awtsmoos.com lets Tiferes translate one renderer-neutral surface covenant,
 * so fresh water, river, pond, ocean, and simulation snapshots all illuminate the same shader without branching the draw path into separate worlds.
 */

import { createWaterUniformLocations } from './WaterUniformLocations.js';
import {
	setWaterFloat,
	setWaterMatrix4,
	setWaterVec2,
	setWaterVec3
} from './WaterUniformWriters.js';

const FALLBACK_NORMAL_LAYER = Object.freeze({
	direction: Object.freeze([1, 0]),
	scale: 0.2,
	speed: 0.05,
	strength: 0
});

/** Cached uniform binder for canonical WebGL surface water. */
export class WaterUniformBinding {
	/** @param {WebGLRenderingContext} gl WebGL context. */
	constructor(gl) {
		this.gl = gl;
		this.locations = Object.freeze({});
	}

	/**
	 * Caches semantic uniform locations for one compiled program.
	 * @param {WebGLProgram} programKli Compiled water program.
	 * @returns {void}
	 */
	setProgram(programKli) {
		this.locations = createWaterUniformLocations(
			this.gl,
			programKli
		);
	}

	/**
	 * Uploads one complete draw state from matrices plus normalized WaterEnvironmentState.
	 * @param {object} drawBinah Model/projection/view matrices and normalized environment state.
	 * @returns {void}
	 */
	bind(drawBinah) {
		const gl = this.gl;
		const locationsYesod = this.locations;
		const environmentBinah = drawBinah.environment;
		const surfaceBinah = environmentBinah.surface;
		const opticsBinah = surfaceBinah.optics;
		const waveBinah = surfaceBinah.wave;
		const normalsBinah = surfaceBinah.normals;
		const layerA = normalLayer(normalsBinah.layers, 0);
		const layerB = normalLayer(normalsBinah.layers, 1);

		setWaterMatrix4(gl, locationsYesod.projection, drawBinah.projectionMatrix);
		setWaterMatrix4(gl, locationsYesod.modelView, drawBinah.modelViewMatrix);
		setWaterMatrix4(gl, locationsYesod.model, drawBinah.modelMatrix);
		setWaterVec3(gl, locationsYesod.camera, environmentBinah.cameraPosition);
		setWaterVec3(gl, locationsYesod.lightDirection, environmentBinah.lightDirection);
		setWaterVec3(gl, locationsYesod.ambient, environmentBinah.ambientLight);
		setWaterVec3(gl, locationsYesod.directional, environmentBinah.directionalLight);
		setWaterFloat(gl, locationsYesod.time, environmentBinah.time);
		setWaterVec3(gl, locationsYesod.current, surfaceBinah.current);
		setWaterVec2(gl, locationsYesod.waveDirection, waveBinah.direction);
		setWaterFloat(gl, locationsYesod.waveAmplitude, waveBinah.amplitude);
		setWaterFloat(gl, locationsYesod.waveLength, waveBinah.wavelength);
		setWaterFloat(gl, locationsYesod.waveSpeed, waveBinah.speed);
		setWaterFloat(gl, locationsYesod.waveTurbulence, environmentBinah.turbulence);
		setWaterVec3(gl, locationsYesod.absorption, opticsBinah.absorption);
		setWaterVec3(gl, locationsYesod.scattering, opticsBinah.scattering);
		setWaterFloat(gl, locationsYesod.depthHint, surfaceBinah.depthHint);
		setWaterFloat(gl, locationsYesod.fresnelF0, opticsBinah.fresnelF0);
		setWaterFloat(gl, locationsYesod.roughness, opticsBinah.roughness);
		setWaterFloat(gl, locationsYesod.refraction, opticsBinah.refraction);
		setWaterFloat(gl, locationsYesod.foam, environmentBinah.foam);
		setWaterFloat(gl, locationsYesod.caustics, opticsBinah.caustics);
		setWaterFloat(gl, locationsYesod.turbidity, opticsBinah.turbidity);
		setWaterFloat(gl, locationsYesod.normalStrength, normalsBinah.strength);
		bindNormalLayer(gl, locationsYesod, 'A', layerA);
		bindNormalLayer(gl, locationsYesod, 'B', layerB);
	}
}

/** @returns {Readonly<object>} Requested procedural normal layer or neutral fallback. */
function normalLayer(layersOros, indexNetzach) {
	return layersOros?.[indexNetzach] || FALLBACK_NORMAL_LAYER;
}

/** Uploads one procedural normal-detail layer through semantic A/B location suffixes. */
function bindNormalLayer(gl, locationsYesod, suffixHod, layerBinah) {
	setWaterVec2(gl, locationsYesod[`normalDirection${suffixHod}`], layerBinah.direction);
	setWaterFloat(gl, locationsYesod[`normalScale${suffixHod}`], layerBinah.scale);
	setWaterFloat(gl, locationsYesod[`normalSpeed${suffixHod}`], layerBinah.speed);
	setWaterFloat(gl, locationsYesod[`normalLayerStrength${suffixHod}`], layerBinah.strength);
}
