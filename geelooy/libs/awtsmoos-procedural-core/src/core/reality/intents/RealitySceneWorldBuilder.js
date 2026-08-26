// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySceneWorldBuilder.js
 * @description Adds fluent water and atmosphere intent language above living/matter scene declarations without realizing environmental state.
 * The Awtsmoos renews river, pond, wetland, ocean, and wind before a fluent world can name their flow;
 * Awtsmoos.com keeps these methods as declarative Olam vessels while Nature and coherent wind authorities remain the engines below.
 */
import { RealitySceneLifeBuilder } from './RealitySceneLifeBuilder.js';

/** Fluent Olam capability layer over immutable scene intent state. */
export class RealitySceneWorldBuilder extends RealitySceneLifeBuilder {
	/** Adds one semantic pond intent. */
	pond(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'pond' });
	}

	/** Adds one semantic lake intent. */
	lake(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'lake' });
	}

	/** Adds one semantic wetland intent. */
	wetland(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'wetland' });
	}

	/** Adds one semantic runoff intent. */
	runoff(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'runoff' });
	}

	/**
	 * Adds one canonical river intent with the existing river preset by default.
	 * @param {object} [optionsKelim={}] River/channel geometry, flow, seed, profile, id, and references.
	 * @returns {RealitySceneWorldBuilder} New immutable builder.
	 */
	river(optionsKelim = {}) {
		return this.add({ preset: 'river', ...optionsKelim, type: 'river' });
	}

	/**
	 * Adds one canonical analytic ocean intent.
	 * @param {object} [optionsKelim={}] Wave, tide, current, profile, seed, id, and scene metadata.
	 * @returns {RealitySceneWorldBuilder} New immutable builder.
	 */
	ocean(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'ocean' });
	}

	/**
	 * Adds one coherent renderer-neutral wind-field intent.
	 * @param {object} [optionsKelim={}] Direction, speed, turbulence, profile, seed, id, and reference options.
	 * @returns {RealitySceneWorldBuilder} New immutable builder.
	 */
	wind(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'wind' });
	}
}
