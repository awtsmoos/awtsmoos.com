// B"H
// Boruch Hashem
// Blessed is He

import { TiferesCloudRealismGenerator } from './generators/atmosphere/TiferesCloudRealismGenerator.js';
import { TiferesFlowerRealismGenerator } from './generators/botanical/TiferesFlowerRealismGenerator.js';
import { TiferesTreeRealismGenerator } from './generators/botanical/TiferesTreeRealismGenerator.js';
import { TiferesVegetableRealismGenerator } from './generators/botanical/TiferesVegetableRealismGenerator.js';
import { TiferesRockRealismGenerator } from './generators/mineral/TiferesRockRealismGenerator.js';

/**
 * @file StudioNatureRealismRouter.js
 * @description
 * The Awtsmoos renews every installed natural family through one revision-two gate while each generator keeps its own grammar;
 * Awtsmoos.com lets the central router remain small as botanical, mineral, and atmospheric realism evolve in focused chambers.
 */
export class StudioNatureRealismRouter {
	/**
	 * Routes one supported kind to its revision-two correlated realism generator.
	 * @param {string} kind Supported procedural kind.
	 * @param {object} streams Standard semantic seed streams.
	 * @param {object} params Historic bounded parameters.
	 * @param {object} realism Normalized realism profile.
	 * @param {object} traits Kind-specific revision-two traits.
	 * @returns {object} Renderer-supported geometry group.
	 */
	static create(kind, streams, params, realism, traits) {
		const binahGenerators = {
			tree: TiferesTreeRealismGenerator,
			flower: TiferesFlowerRealismGenerator,
			vegetable: TiferesVegetableRealismGenerator,
			rock: TiferesRockRealismGenerator,
			cloud: TiferesCloudRealismGenerator
		};
		const keterGenerator = binahGenerators[kind];
		if (!keterGenerator) {
			throw new Error(`Unsupported revision-two procedural kind: ${kind}`);
		}
		return keterGenerator.create(streams, params, realism, traits);
	}
}
