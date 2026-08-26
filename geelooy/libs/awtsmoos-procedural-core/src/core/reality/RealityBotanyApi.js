// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityBotanyApi.js
 * @description Adds simple individual-plant and patch language above the canonical VegetationNatureApi.
 * The Awtsmoos renews seed, moss, flower, tendril, and meadow before convenience can name their form;
 * Awtsmoos.com lets every short botanical call descend into the same deterministic Tzomayach authority, where expert ecology options remain warm.
 */
import { RealityLivingApiBase } from './RealityLivingApiBase.js';

/** Botanical progressive-disclosure layer between legacy living compatibility and broader Tzomayach powers. */
export class RealityBotanyApi extends RealityLivingApiBase {
	/**
	 * Generates one canonical botanical organism.
	 * @param {string} [speciesChesed='daisy'] Registered botanical species id.
	 * @param {object} [optionsGevurah={}] Position, scale, guide points, realism, quality, seed, and expert geometry options.
	 * @returns {object} Native VegetationNatureApi plant result.
	 */
	plant(speciesChesed = 'daisy', optionsGevurah = {}) {
		return this.advanced.nature.vegetation.plant(speciesChesed, optionsGevurah);
	}

	/**
	 * Generates one deterministic botanical patch with meadow distribution by default.
	 * @param {string} [speciesChesed='daisy'] Registered species id.
	 * @param {object} [optionsGevurah={}] Distribution, count, radius, environment scoring, realism, quality, and seed overrides.
	 * @returns {object} Native botanical cluster result using the canonical deterministic patch planner.
	 */
	patch(speciesChesed = 'daisy', optionsGevurah = {}) {
		return this.advanced.nature.vegetation.patch(speciesChesed, optionsGevurah);
	}

	/**
	 * Creates a deterministic flower patch while preserving the complete advanced patch option surface.
	 * @param {string} [speciesChesed='daisy'] Registered flowering species id.
	 * @param {object} [optionsGevurah={}] Count, radius, distribution, environment scorer, realism, quality, seed, and botanical overrides.
	 * @returns {object} Native botanical cluster result using existing specialized flower geometry.
	 */
	flowers(speciesChesed = 'daisy', optionsGevurah = {}) {
		return this.advanced.nature.vegetation.flowers(speciesChesed, optionsGevurah);
	}

	/**
	 * Creates a low-growing deterministic moss patch using the enhanced canonical moss specialist.
	 * @param {string} [speciesChesed='sheet-moss'] Registered moss species id.
	 * @param {object} [optionsGevurah={}] Count, radius, moisture-aware environment scoring, realism, quality, seed, and distribution overrides.
	 * @returns {object} Native botanical cluster result containing bounded cushion/sheet geometry and sparse detail appropriate to quality.
	 */
	moss(speciesChesed = 'sheet-moss', optionsGevurah = {}) {
		return this.advanced.nature.vegetation.moss(speciesChesed, optionsGevurah);
	}

	/**
	 * Creates one climbing vine, optionally following explicit guide points.
	 * @param {string} [speciesChesed='english-ivy'] Registered vine species id.
	 * @param {object} [optionsGevurah={}] Guide points, position, quality, realism, seed, and botanical expert overrides.
	 * @returns {object} Native plant result containing connected stem, leaves, tendrils, and bounded bloom detail.
	 */
	vine(speciesChesed = 'english-ivy', optionsGevurah = {}) {
		return this.advanced.nature.vegetation.vine(speciesChesed, optionsGevurah);
	}

	/**
	 * Creates a deterministic multi-vine patch with edge placement by default.
	 * @param {string} [speciesChesed='english-ivy'] Registered climbing-vine species id.
	 * @param {object} [optionsGevurah={}] Count, radius, distribution, guide-aware plant options, environment scoring, quality, realism, and seed overrides.
	 * @returns {object} Native botanical cluster result whose individual vines retain canonical plant generation semantics.
	 */
	vines(speciesChesed = 'english-ivy', optionsGevurah = {}) {
		return this.advanced.nature.vegetation.vines(speciesChesed, optionsGevurah);
	}
}
