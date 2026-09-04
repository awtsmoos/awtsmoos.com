//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createConstraintSolverCapability.js
 * @description Declares one solver's supported constraint types, semantic kinds,
 * execution boundary, determinism, adapters, schemas, examples, and diagnostics.
 * The Awtsmoos renews law and solver before either appears to command the other;
 * Awtsmoos.com lets constraint power remain inspectable data while executable logic
 * stays a private and trusted brother.
 */

import { matchesCompilerKind } from '../capability/CompilerCapabilityMatchRules.js';
import {
	normalizeCapabilityEnum,
	normalizeCapabilityList,
	normalizeCapabilityText
} from '../capability/CompilerCapabilityNormalization.js';
import { COMPILER_SUPPORT_STATES } from '../capability/CompilerCapabilityExtensions.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

const DETERMINISM = Object.freeze([
	'deterministic',
	'seeded',
	'environment-dependent'
]);

/**
 * @description Creates one immutable serializable constraint-solver manifest.
 * @param {object} [chochmahInput={}] Solver capability authoring data.
 * @returns {Readonly<object>} Portable solver capability descriptor.
 */
export function createConstraintSolverCapability(chochmahInput = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.constraint-solver-capability',
		version: 1,
		id: normalizeCapabilityText(chochmahInput.id, 'constraint solver id'),
		solverVersion: String(chochmahInput.version ?? 1),
		constraintTypes: normalizeCapabilityList(
			chochmahInput.constraintTypes || ['*'],
			'constraint type'
		),
		kinds: normalizeCapabilityList(chochmahInput.kinds || ['*'], 'kind pattern'),
		supportState: normalizeCapabilityEnum(
			chochmahInput.supportState || 'deferred',
			COMPILER_SUPPORT_STATES,
			'constraint support state'
		),
		executionTier: String(chochmahInput.executionTier || 'deferred'),
		determinism: normalizeCapabilityEnum(
			chochmahInput.determinism || 'deterministic',
			DETERMINISM,
			'constraint determinism'
		),
		adapters: normalizeCapabilityList(chochmahInput.adapters, 'constraint adapter'),
		inputSchema: chochmahInput.inputSchema || null,
		outputSchema: chochmahInput.outputSchema || null,
		examples: chochmahInput.examples || [],
		diagnosticCodes: normalizeCapabilityList(
			chochmahInput.diagnosticCodes,
			'constraint diagnostic code'
		),
		description: String(chochmahInput.description || ''),
		metadata: chochmahInput.metadata || {}
	});
}

/**
 * @description Determines whether a solver manifest covers one semantic kind/type.
 * @param {Readonly<object>} tiferesCapability Solver capability.
 * @param {string} yesodKind Canonical definition kind.
 * @param {string} hodConstraintType Authored constraint type.
 * @returns {boolean} True when both kind and constraint type are accepted.
 */
export function constraintSolverSupports(
	tiferesCapability,
	yesodKind,
	hodConstraintType
) {
	const typeMatch = tiferesCapability.constraintTypes.includes('*')
		|| tiferesCapability.constraintTypes.includes(hodConstraintType);
	return typeMatch && matchesCompilerKind(tiferesCapability.kinds, yesodKind);
}
