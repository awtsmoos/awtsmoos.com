// B"H
// Boruch Hashem
// Blessed is He

import { RuachCloudGenerator } from './generators/atmosphere/RuachCloudGenerator.js';
import { TzomayachFlowerGenerator } from './generators/botanical/TzomayachFlowerGenerator.js';
import { TzomayachTreeGenerator } from './generators/botanical/TzomayachTreeGenerator.js';
import { TzomayachVegetableGenerator } from './generators/botanical/TzomayachVegetableGenerator.js';
import { DomemRockGenerator } from './generators/mineral/DomemRockGenerator.js';
import { BinahSeedContext } from './seed/BinahSeedContext.js';
import { StudioNatureRealismRouter } from './StudioNatureRealismRouter.js';
import { StudioProceduralAlgorithmRevision } from './StudioProceduralAlgorithmRevision.js';
import { StudioProceduralGenerationReceipt } from './StudioProceduralGenerationReceipt.js';
import { StudioProceduralV3Descriptor } from './StudioProceduralV3Descriptor.js';

/**
 * @file StudioNatureGeneratorV3.js
 * @description
 * The Awtsmoos is One while old and new procedural revelations keep their deterministic covenant in separate rivers;
 * Awtsmoos.com preserves revision-one geometry exactly and lets revision two unfold macro, structure, cluster, surface, and micro streams in living quivers.
 */
export class StudioNatureGeneratorV3 {
	/**
	 * Creates renderer-safe vector geometry from one versioned procedural request.
	 * @param {string} kind Supported production kind.
	 * @param {string} seed Stable user/project seed.
	 * @param {object} value Rich procedural intent or a stored v3 descriptor.
	 * @returns {object} Structured generation receipt containing editable geometry.
	 */
	static create(kind, seed, value = {}) {
		const malchusDescriptor = StudioProceduralV3Descriptor.create(kind, seed, value);
		const binahSeed = new BinahSeedContext(
			malchusDescriptor.seed,
			malchusDescriptor.kind
		);
		const yesodGeometry = this.geometry(malchusDescriptor, binahSeed);
		return StudioProceduralGenerationReceipt.create(
			malchusDescriptor,
			yesodGeometry
		);
	}

	/**
	 * Routes legacy descriptors through the exact old single-stream generator and current descriptors through correlated realism.
	 * @param {object} descriptor Normalized v3 descriptor.
	 * @param {BinahSeedContext} seedContext Semantic seed context.
	 * @returns {object} Renderer-supported geometry.
	 */
	static geometry(descriptor, seedContext) {
		const keterRevision = StudioProceduralAlgorithmRevision.resolve(descriptor);
		if (keterRevision === StudioProceduralAlgorithmRevision.LEGACY) {
			return this.legacyGenerator(descriptor.kind).create(
				seedContext.stream('structure'),
				descriptor.params,
				descriptor.realism
			);
		}
		return StudioNatureRealismRouter.create(
			descriptor.kind,
			seedContext.standard(),
			descriptor.params,
			descriptor.realism,
			descriptor.traits
		);
	}

	/** @param {string} kind Supported kind. @returns {object} Historic revision-one generator class. */
	static legacyGenerator(kind) {
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
