// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySceneLifeBuilder.js
 * @description Adds fluent Tzomayach and Chai intent language while generation remains owned by Nature and Chai authorities.
 * The Awtsmoos renews root, blossom, vine, tree, creature, and herd before the builder may speak their names;
 * Awtsmoos.com lets living worlds read like poetry while every chain link stays ordinary data beneath the flames.
 */
import { RealitySceneMatterBuilder } from './RealitySceneMatterBuilder.js';

/** Fluent living-world capability layer over immutable scene intent state. */
export class RealitySceneLifeBuilder extends RealitySceneMatterBuilder {
	/** Adds one canonical botanical organism intent. */
	plant(speciesOhr = 'daisy', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'plant' });
	}

	/** Adds one deterministic flower-patch intent. */
	flowers(speciesOhr = 'daisy', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'flowers' });
	}

	/** Adds one low-growing canonical moss-patch intent. */
	moss(speciesOhr = 'sheet-moss', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'moss' });
	}

	/** Adds one guide-aware climbing-vine intent. */
	vine(speciesOhr = 'english-ivy', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'vine' });
	}

	/** Adds one deterministic multi-vine patch intent. */
	vines(speciesOhr = 'english-ivy', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'vines' });
	}

	/**
	 * Adds one canonical tree intent.
	 * @param {string} [treeOhr='Oak Medium'] Existing tree preset/species selector.
	 * @param {object} [optionsKelim={}] Tree, profile, id, and reference options.
	 * @returns {RealitySceneLifeBuilder} New immutable builder.
	 */
	tree(treeOhr = 'Oak Medium', optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'tree', value: treeOhr });
	}

	/**
	 * Adds one canonical creature intent.
	 * @param {string} [speciesOhr='sheep'] Registered creature species id.
	 * @param {object} [optionsKelim={}] Creature compiler, profile, id, and scene-reference options.
	 * @returns {RealitySceneLifeBuilder} New immutable builder.
	 */
	creature(speciesOhr = 'sheep', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'creature' });
	}

	/**
	 * Adds one habitat-aware fauna population intent without eagerly creating creatures.
	 * @param {object} [optionsKelim={}] Species, count, bounds, habitat, grouping, id, and profile options.
	 * @returns {RealitySceneLifeBuilder} New immutable builder.
	 */
	fauna(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'fauna' });
	}
}
