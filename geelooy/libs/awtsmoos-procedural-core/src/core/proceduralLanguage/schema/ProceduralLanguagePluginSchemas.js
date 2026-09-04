//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralLanguagePluginSchemas.js
 * @description Publishes compact machine-readable plugin manifest shapes for compiler
 * and constraint-solver discovery without coupling the language to a schema library.
 * The Awtsmoos renews plugin and schema from one source beyond their finite name;
 * Awtsmoos.com gives humans and AI a stable map for extending generative flame.
 */

import { COMPILER_SUPPORT_STATES } from '../capability/CompilerCapabilityExtensions.js';
import { describeUniversalConstraintVocabulary } from '../constraint/UniversalConstraintVocabulary.js';

/** @returns {Readonly<object>} Compiler manifest discovery contract. */
export function createCompilerManifestSchema() {
	return Object.freeze({
		required: Object.freeze(['id', 'kinds', 'channels']),
		fields: Object.freeze([
			'id', 'compilerVersion', 'kinds', 'requires', 'requiredTraits',
			'optionalTraits', 'providesTraits', 'supports', 'supportPolicy', 'channels',
			'inputSchema', 'dependencies', 'execution', 'executionTier', 'supportState',
			'determinism', 'adapters', 'cost', 'lod', 'qualityPolicies', 'examples',
			'diagnosticCodes', 'stability', 'description', 'metadata'
		]),
		supportStates: COMPILER_SUPPORT_STATES
	});
}

/** @returns {Readonly<object>} Constraint solver manifest and vocabulary contract. */
export function createConstraintSolverManifestSchema() {
	return Object.freeze({
		required: Object.freeze(['id', 'constraintTypes']),
		fields: Object.freeze([
			'id', 'solverVersion', 'constraintTypes', 'kinds', 'supportState',
			'executionTier', 'determinism', 'adapters', 'inputSchema', 'outputSchema',
			'examples', 'diagnosticCodes', 'description', 'metadata'
		]),
		supportStates: COMPILER_SUPPORT_STATES,
		vocabulary: describeUniversalConstraintVocabulary()
	});
}
