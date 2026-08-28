//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralInspectionApi.js
 * @description Provides definition/schema/query/diff/snapshot/determinism inspection while inherited registry discovery reveals the available procedural universe without executable leakage.
 * The Awtsmoos knows every vessel before inspection names a hidden relation, difference, or deterministic thread;
 * Awtsmoos.com lets Daas expose portable evidence while registry discovery remains a smaller inherited crown above its head.
 */

import { createProceduralLanguageCapabilities } from '../capabilities/createProceduralLanguageCapabilities.js';
import { diffProceduralDefinitions } from '../diff/diffProceduralDefinitions.js';
import { explainProceduralDeterminism } from '../provenance/explainProceduralDeterminism.js';
import { queryProceduralLanguage } from '../query/queryProceduralLanguage.js';
import { createProceduralLanguageSchema } from '../schema/createProceduralLanguageSchema.js';
import { createProceduralSnapshot } from '../snapshot/createProceduralSnapshot.js';
import { validateProceduralDefinition } from '../validation/validateProceduralDefinition.js';
import { ProceduralRegistryInspectionApi } from './ProceduralRegistryInspectionApi.js';

export class ProceduralInspectionApi extends ProceduralRegistryInspectionApi {
	/**
	 * @description Captures the shared authority constellation through the registry-inspection parent while retaining no independent mutable inspection state.
	 * @param {object} [chochmahAuthorities={}] Shared procedural registries and runtime authorities used only through read-only discovery methods.
	 */
	constructor(chochmahAuthorities = {}) {
		super(chochmahAuthorities);
	}

	/**
	 * @description Returns operation capability truth grouped by execution boundary from the shared operation registry.
	 * @returns {Readonly<object>} Serializable procedural-language capability manifest.
	 */
	capabilities() {
		return createProceduralLanguageCapabilities(this.registry || undefined);
	}

	/**
	 * @description Returns the portable schema-like language contract used by editors, documentation, validation, and AI/RAG authoring surfaces.
	 * @returns {Readonly<object>} Serializable procedural-language schema contract.
	 */
	schema() {
		return createProceduralLanguageSchema({
			registry: this.registry || undefined
		});
	}

	/**
	 * @description Validates one definition under caller-selected none, fast, or strict policy while defaulting to this API instance's shared operation registry.
	 * @param {object|string} chochmahInput Procedural definition-compatible input.
	 * @param {object} [binahOptions={}] Validation policy and optional explicit registry override.
	 * @returns {Readonly<object>} Structured validation diagnostics and normalized evidence.
	 */
	validate(chochmahInput, binahOptions = {}) {
		return validateProceduralDefinition(chochmahInput, {
			...binahOptions,
			registry: binahOptions.registry || this.registry || undefined
		});
	}

	/**
	 * @description Reads values or filters array sections through safe JSON paths and plain serializable predicate descriptions.
	 * @param {object|string} chochmahInput Procedural definition-compatible input.
	 * @param {object} [binahQuery={}] Portable query descriptor.
	 * @returns {unknown} Query-engine result detached from registry implementation state.
	 */
	query(chochmahInput, binahQuery = {}) {
		return queryProceduralLanguage(chochmahInput, binahQuery);
	}

	/**
	 * @description Computes deterministic JSON-path semantic differences between two canonicalizable procedural definitions.
	 * @param {object|string} chochmahFirst First definition-compatible value.
	 * @param {object|string} binahSecond Second definition-compatible value.
	 * @returns {ReadonlyArray<object>} Immutable semantic difference records.
	 */
	diff(chochmahFirst, binahSecond) {
		return diffProceduralDefinitions(chochmahFirst, binahSecond);
	}

	/**
	 * @description Captures reproducible definition, artifact, and capability evidence for debugging, tests, handoff, and future-agent comparison.
	 * @param {object|string} chochmahInput Definition-compatible value to snapshot.
	 * @param {object} [binahOptions={}] Snapshot policy and optional artifact evidence.
	 * @returns {Readonly<object>} Immutable reproducibility snapshot.
	 */
	snapshot(chochmahInput, binahOptions = {}) {
		return createProceduralSnapshot(chochmahInput, binahOptions);
	}

	/**
	 * @description Explains identity-sensitive definition sections and deterministic sub-hashes so cache/provenance behavior can be reasoned about without guessing.
	 * @param {object|string} chochmahInput Procedural definition-compatible input.
	 * @returns {Readonly<object>} Determinism and semantic-hash explanation evidence.
	 */
	determinism(chochmahInput) {
		return explainProceduralDeterminism(chochmahInput);
	}
}
