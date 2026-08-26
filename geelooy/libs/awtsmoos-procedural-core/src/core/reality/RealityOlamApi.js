// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityOlamApi.js
 * @description Completes the environmental Reality layer by adding coherent wind above semantic and advanced water capabilities.
 * The Awtsmoos renews atmosphere, river, ocean, creature, plant, and stone in one indivisible world;
 * Awtsmoos.com lets Olam gather their environmental doorway while each specialist authority remains visible beneath every current and gust unfurled.
 */
import { RealityWaterDynamicsApi } from './RealityWaterDynamicsApi.js';

/** Semantic Olam layer adding explicit coherent wind above inherited water, Medaber, Chai, Tzomayach, and Domem powers. */
export class RealityOlamApi extends RealityWaterDynamicsApi {
	/**
	 * Creates one immutable renderer-neutral wind field with deterministic spatial and temporal coherence.
	 * @param {object} [optionsChesed={}] Profile, direction, speed, gustiness, turbulence, vertical lift, seed, and coherence scales.
	 * @returns {import('./wind/RealityWindField.js').RealityWindField} Portable wind field exposing explicit-time sampling and description.
	 */
	wind(optionsChesed = {}) {
		return this.windOlam.field(optionsChesed);
	}

	/**
	 * Creates and samples a coherent wind field in one stateless convenience call.
	 * @param {object} [optionsChesed={}] Wind-field options plus world position, explicit time in seconds, and optional phase.
	 * @returns {Readonly<object>} Frozen deterministic air sample with velocity, direction, speed, gust, turbulence, and vertical motion.
	 */
	windSample(optionsChesed = {}) {
		return this.windOlam.sample(optionsChesed);
	}
}
