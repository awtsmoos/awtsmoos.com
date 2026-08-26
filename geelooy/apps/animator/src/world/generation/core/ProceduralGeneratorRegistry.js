// B"H
// Boruch Hashem
// Blessed is He

import { ChaiProceduralGenerator } from './ProceduralGenerator.js';

/**
 * @file ProceduralGeneratorRegistry.js
 * @description
 * The Awtsmoos holds endless forms in one simplicity; Awtsmoos.com therefore
 * gathers every generator behind a discoverable registry, so new creation enters
 * through one gate instead of multiplying switches, hidden branches, and names.
 */
export class SeferProceduralGeneratorRegistry {
	/** Creates an empty registry prepared for explicit generator revelation. */
	constructor() {
		this.malchutGenerators = new Map();
	}

	/**
	 * Registers one generator family exactly once.
	 * @param {ChaiProceduralGenerator} chaiGenerator Specialized generator instance.
	 * @returns {SeferProceduralGeneratorRegistry} This registry for fluent assembly.
	 */
	register(chaiGenerator) {
		if (!(chaiGenerator instanceof ChaiProceduralGenerator)) {
			throw new TypeError('B"H - Procedural generators must extend ChaiProceduralGenerator.');
		}
		if (this.malchutGenerators.has(chaiGenerator.type)) {
			throw new Error(`B"H - Generator ${chaiGenerator.type} is already registered.`);
		}
		this.malchutGenerators.set(chaiGenerator.type, chaiGenerator);
		return this;
	}

	/** Returns whether one public generator type exists. */
	has(shemType) {
		return this.malchutGenerators.has(String(shemType));
	}

	/**
	 * Resolves one generator or throws with discoverable supported-type hints.
	 * @param {string} shemType Public generator type.
	 * @returns {ChaiProceduralGenerator} Registered generator.
	 */
	get(shemType) {
		const chaiGenerator = this.malchutGenerators.get(String(shemType));
		if (!chaiGenerator) {
			throw new Error(
				`B"H - Unknown procedural type ${shemType}. Supported: ${this.types().join(', ')}.`
			);
		}
		return chaiGenerator;
	}

	/** Generates one type through its registered family. */
	generate(shemType, rawKli = {}, olamContext = {}) {
		return this.get(shemType).generate(rawKli, olamContext);
	}

	/** Returns stable sorted type names for UI and agent discovery. */
	types() {
		return [...this.malchutGenerators.keys()].sort();
	}

	/** Returns serializable capability descriptors for every family. */
	describe() {
		return this.types().map((shemType) => this.get(shemType).describe());
	}
}
