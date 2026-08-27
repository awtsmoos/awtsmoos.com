//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralGeneratorRegistry.js
 * @description Registers deterministic named definition generators so presets, species, structures, materials, and future procedural grammars enter one JSON covenant.
 * The Awtsmoos is One before generator names divide possibility; Awtsmoos.com lets each domain reveal definitions through explicit registration rather than central hard-coded switch reality.
 */

import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

/**
 * Registry of definition generators whose runtime functions remain outside serialized public metadata.
 * @class
 */
export class ProceduralGeneratorRegistry {
	constructor() {
		this.generators = new Map();
	}

	/**
	 * Registers one generator under a stable id.
	 * @param {string} id Generator identifier.
	 * @param {Function} generator Function receiving options and context and returning definition-compatible data.
	 * @param {{description?: string, kind?: string, stability?: string, override?: boolean}} [options={}] Discovery and overwrite policy.
	 * @returns {ProceduralGeneratorRegistry} This registry for fluent setup.
	 */
	register(id, generator, options = {}) {
		const key = String(id);
		if (typeof generator !== 'function') throw new TypeError('B"H | Procedural generator must be a function.');
		if (this.generators.has(key) && options.override !== true) {
			throw new Error(`B"H | Procedural generator already registered: ${key}`);
		}
		this.generators.set(key, {
			generator,
			description: String(options.description || ''),
			kind: String(options.kind || 'generic'),
			stability: String(options.stability || 'stable')
		});
		return this;
	}

	/** Generates one canonical immutable definition through the selected generator. */
	generate(id, options = {}, context = {}) {
		const entry = this.generators.get(String(id));
		if (!entry) {
			const error = new Error(`B"H | Unknown procedural generator: ${id}`);
			error.code = 'PROCEDURAL_GENERATOR_NOT_FOUND';
			throw error;
		}
		return createProceduralDefinition(entry.generator(options, context));
	}

	/** Returns serializable generator discovery metadata. */
	describe() {
		return Object.freeze([...this.generators.entries()]
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([id, entry]) => Object.freeze({
				id,
				description: entry.description,
				kind: entry.kind,
				stability: entry.stability
			})));
	}
}
