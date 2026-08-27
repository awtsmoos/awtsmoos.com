//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralInspectionApi.js
 * @description Gathers capabilities, schema, validation, query, diff, snapshots, determinism, and registry discovery into one read-only professional inspection surface.
 * The Awtsmoos knows every vessel before inspection names its hidden relation; Awtsmoos.com makes project truth observable so editors, developers, and AI need not guess implementation station.
 */

import { createProceduralLanguageCapabilities } from '../capabilities/createProceduralLanguageCapabilities.js';
import { diffProceduralDefinitions } from '../diff/diffProceduralDefinitions.js';
import { explainProceduralDeterminism } from '../provenance/explainProceduralDeterminism.js';
import { queryProceduralLanguage } from '../query/queryProceduralLanguage.js';
import { createProceduralLanguageSchema } from '../schema/createProceduralLanguageSchema.js';
import { createProceduralSnapshot } from '../snapshot/createProceduralSnapshot.js';
import { validateProceduralDefinition } from '../validation/validateProceduralDefinition.js';

/**
 * Read-only facade over language discovery, validation, and semantic inspection contracts.
 * @class
 */
export class ProceduralInspectionApi {
	/**
	 * @param {{registry?: object, resolverRegistry?: object, generatorRegistry?: object, domainRegistry?: object}} [options={}] Inspection authorities.
	 */
	constructor(options = {}) {
		this.registry = options.registry || null;
		this.resolverRegistry = options.resolverRegistry || null;
		this.generatorRegistry = options.generatorRegistry || null;
		this.domainRegistry = options.domainRegistry || null;
	}

	/** Returns complete operation capability truth grouped by execution boundary. */
	capabilities() {
		return createProceduralLanguageCapabilities(this.registry || undefined);
	}

	/** Returns a portable schema-like contract suitable for editors, docs, validation, and AI. */
	schema() {
		return createProceduralLanguageSchema({
			registry: this.registry || undefined
		});
	}

	/** Validates a definition with none, fast, or strict policy and structured diagnostics. */
	validate(input, options = {}) {
		return validateProceduralDefinition(input, {
			...options,
			registry: options.registry || this.registry || undefined
		});
	}

	/** Reads values or filters array sections through safe JSON paths and plain predicates. */
	query(input, query = {}) {
		return queryProceduralLanguage(input, query);
	}

	/** Returns deterministic JSON-path semantic differences between canonical definitions. */
	diff(first, second) {
		return diffProceduralDefinitions(first, second);
	}

	/** Captures reproducible definition/artifact/capability evidence for debugging and handoff. */
	snapshot(input, options = {}) {
		return createProceduralSnapshot(input, options);
	}

	/** Explains identity-sensitive definition sections and deterministic sub-hashes. */
	determinism(input) {
		return explainProceduralDeterminism(input);
	}

	/** Returns serializable operation, semantic resolver, generator, and domain registry discovery. */
	registries() {
		return Object.freeze({
			operations: this.registry?.describe?.() || Object.freeze([]),
			resolvers: this.resolverRegistry?.describe?.() || Object.freeze([]),
			generators: this.generatorRegistry?.describe?.() || Object.freeze([]),
			domains: this.domainRegistry?.describe?.() || Object.freeze([])
		});
	}
}
