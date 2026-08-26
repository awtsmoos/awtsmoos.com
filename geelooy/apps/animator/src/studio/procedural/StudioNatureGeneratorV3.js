// B"H
// Boruch Hashem
// Blessed is He

import { BinahSeedContext } from './seed/BinahSeedContext.js';
import { StudioProceduralGenerationReceipt } from './StudioProceduralGenerationReceipt.js';
import { StudioProceduralV3Descriptor } from './StudioProceduralV3Descriptor.js';
import { RuachCloudGenerator } from './generators/atmosphere/RuachCloudGenerator.js';
import { TzomayachFlowerGenerator } from './generators/botanical/TzomayachFlowerGenerator.js';
import { TzomayachTreeGenerator } from './generators/botanical/TzomayachTreeGenerator.js';
import { TzomayachVegetableGenerator } from './generators/botanical/TzomayachVegetableGenerator.js';
import { DomemRockGenerator } from './generators/mineral/DomemRockGenerator.js';

/**
 * @file StudioNatureGeneratorV3.js
 * @description
 * The Awtsmoos is One while tree, flower, root, stone, and cloud reveal distinct forms through measured vessels;
 * Awtsmoos.com keeps v3 opt-in, deterministic, receipt-bearing, and separate from the untouched v2 river that old projects already trust.
 */
export class StudioNatureGeneratorV3 {
	/**
	 * Creates richer vector geometry from one data-first procedural request.
	 * @param {string} kind Supported production kind.
	 * @param {string} seed Stable user/project seed.
	 * @param {object} value Realism, material, variation, and generator params.
	 * @returns {object} Structured generation receipt containing editable geometry.
	 */
	static create(kind, seed, value = {}) {
		const malchusDescriptor = StudioProceduralV3Descriptor.create(kind, seed, value);
		const binahSeed = new BinahSeedContext(
			malchusDescriptor.seed,
			malchusDescriptor.kind
		);
		const chochmahGenerator = this.generator(malchusDescriptor.kind);
		const yesodGeometry = chochmahGenerator.create(
			binahSeed.stream('structure'),
			malchusDescriptor.params,
			malchusDescriptor.realism
		);
		return StudioProceduralGenerationReceipt.create(
			malchusDescriptor,
			yesodGeometry
		);
	}

	/** @param {string} kind Supported kind. @returns {object} Focused generator class for that kind. */
	static generator(kind) {
		const tiferesGenerators = {
			tree: TzomayachTreeGenerator,
			vegetable: TzomayachVegetableGenerator,
			flower: TzomayachFlowerGenerator,
			rock: DomemRockGenerator,
			cloud: RuachCloudGenerator
		};
		const gevurahGenerator = tiferesGenerators[kind];
		if (!gevurahGenerator) {
			throw new Error(`No v3 procedural generator installed for: ${kind}`);
		}
		return gevurahGenerator;
	}
}
